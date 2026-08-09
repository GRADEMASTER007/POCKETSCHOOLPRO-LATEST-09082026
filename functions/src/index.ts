import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";
import { google } from "googleapis";

admin.initializeApp();
const db = admin.firestore();

// --- YOCO INTEGRATION ---

/**
 * Creates a Yoco Payment Intent
 * Call from frontend to get a checkout token/id
 */
export const createYocoPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { amount, currency = "ZAR" } = data;
  const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

  if (!YOCO_SECRET_KEY) {
    console.error("YOCO_SECRET_KEY not set");
    throw new functions.https.HttpsError("internal", "Server configuration error.");
  }

  try {
    const response = await axios.post(
      "https://online.yoco.com/v1/payment-intents",
      {
        amount: amount * 100, // Yoco expects cents
        currency,
        metadata: {
          userId: context.auth.uid,
          email: context.auth.token.email,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        },
      }
    );

    return {
      success: true,
      clientSecret: response.data.client_secret,
      id: response.data.id,
    };
  } catch (error: any) {
    console.error("Yoco Payment Intent Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Failed to create payment intent.");
  }
});

/**
 * Webhook for Yoco Payment Success
 */
export const yocoWebhookEndpoint = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["yoco-signature-256"] as string;
  const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET;

  // Verify Webhook Signature (Simplified example, use Yoco's verification logic in production)
  // Typically involves HMAC SHA256 of the payload with the secret
  
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", YOCO_WEBHOOK_SECRET || "")
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Invalid Yoco Webhook Signature");
    res.status(401).send("Unauthorized");
    return;
  }

  const event = req.body;

  if (event.type === "payment.succeeded") {
    const { userId, email } = event.payload.metadata;
    const amount = event.payload.amount / 100;

    try {
      const batch = db.batch();
      
      // Update User Role
      const userRef = db.collection("users").doc(userId);
      batch.update(userRef, {
        role: "premium",
        subscriptionState: "active",
        updatedAt: Date.now(),
      });

      // Log Transaction
      const txRef = db.collection("transactions").doc();
      batch.set(txRef, {
        userId,
        email,
        amount,
        currency: event.payload.currency,
        status: "success",
        provider: "yoco",
        paymentId: event.payload.id,
        createdAt: Date.now(),
      });

      await batch.commit();
      console.log(`User ${userId} upgraded to Premium via Yoco`);
      res.status(200).send("Success");
    } catch (error) {
      console.error("Firestore update error after Yoco payment:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(200).send("Event ignored");
  }
});

// --- GOOGLE PLAY BILLING RTDN ---

/**
 * Triggered by Pub/Sub when Google Play sends a notification
 */
export const playStoreBillingWebhook = functions.pubsub
  .topic("play-billing-notifications")
  .onPublish(async (message) => {
    const data = JSON.parse(Buffer.from(message.data, "base64").toString());
    const { packageName, subscriptionNotification, purchaseToken } = data;

    if (!subscriptionNotification) return;

    const GOOGLE_PLAY_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT || "{}");
    
    const auth = new google.auth.JWT(
      GOOGLE_PLAY_SERVICE_ACCOUNT.client_email,
      undefined,
      GOOGLE_PLAY_SERVICE_ACCOUNT.private_key,
      ["https://www.googleapis.com/auth/androidpublisher"]
    );

    const androidpublisher = google.androidpublisher({ version: "v3", auth });

    try {
      const subscription = await androidpublisher.purchases.subscriptions.get({
        packageName,
        subscriptionId: subscriptionNotification.subscriptionId,
        token: purchaseToken,
      });

      const { paymentState, acknowledgementState, externalAccountId: userId } = subscription.data;

      if (!userId) {
        console.warn("No userId (externalAccountId) found in subscription data");
        return;
      }

      const userRef = db.collection("users").doc(userId);

      // paymentState: 1 = Payment received, 0 = Payment pending, 2 = Free trial
      if (paymentState === 1 || paymentState === 2) {
        await userRef.update({
          role: "premium",
          subscriptionState: "active",
          updatedAt: Date.now(),
        });
        console.log(`User ${userId} Google Play subscription active`);
      } else {
        // Handle expiration or cancellation
        await userRef.update({
          role: "student",
          subscriptionState: "expired",
          updatedAt: Date.now(),
        });
        console.log(`User ${userId} Google Play subscription inactive`);
      }
    } catch (error) {
      console.error("Google Play Developer API Error:", error);
    }
  });
