# Grade Master: Play Store TWA (Trusted Web Activity) Packaging Guide

To publish Grade Master as a native Android application on the Google Play Store, we utilize **Trusted Web Activities (TWA)**. TWAs allow us to wrap our existing High-Performance PWA (Progressive Web App) in an Android container without rewriting the application in Kotlin or Java.

Because the app already uses `vite-plugin-pwa`, serves a valid `manifest.json`, and registers a service worker for offline capabilities, it is fully ready to be packaged as a TWA.

## Prerequisites
1. **Google Play Console Developer Account** ($25 one-time fee).
2. **Node.js** installed on your local machine.
3. Your app must be deployed to a production URL (e.g., `https://ais-pre-px3cca2y37hk6xugu6tyhg-1007192288317.europe-west2.run.app` or a custom domain).

---

## Step 1: Install Bubblewrap
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) is Google's official CLI tool for generating and building TWAs.

```bash
npm i -g @google/bubblewrap
```

---

## Step 2: Initialize the TWA Project
Create a new directory for your Android app source code.

```bash
mkdir GradeMasterAndroid
cd GradeMasterAndroid
```

Initialize the project by pointing Bubblewrap to your production Web App Manifest.

```bash
bubblewrap init --manifest https://ais-pre-px3cca2y37hk6xugu6tyhg-1007192288317.europe-west2.run.app/manifest.json
```

Bubblewrap will prompt you to confirm various details based on your `manifest.json`:
- **Web App URL**: (Leave as default, your production URL)
- **Application Name**: Grade Master
- **Short Name**: GradeMaster
- **Package Name**: `com.grademaster.africa.twa`
- **Icon**: Verify the path to your 512x512 maskable icon.
- **Theme Color**: Confirm the hex code (e.g., `#0f172a`).

---

## Step 3: Generate the Digital Asset Links (DAL)
For the TWA to display without the browser URL bar, you must prove ownership of the web domain to the Android app. This is done via Digital Asset Links.

1. Bubblewrap will generate a keystore file during initialization (e.g., `android.keystore`). Keep this safe! It's required for Play Store updates.
2. Bubblewrap will also ask you to generate the `assetlinks.json` file.
3. The content of `assetlinks.json` will look like this:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.grademaster.africa.twa",
    "sha256_cert_fingerprints": [
      "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
    ]
  }
}]
```

4. You MUST host this `assetlinks.json` file on your web server at exactly this path:
   `https://[YOUR_DOMAIN]/.well-known/assetlinks.json`

*(Note: In our Vite setup, place the `assetlinks.json` file inside the `public/.well-known/` directory so it is served correctly in production).*

---

## Step 4: Build the Android App Bundle (AAB)
Once initialization is complete and you have verified the asset links file is hosted, build the app:

```bash
bubblewrap build
```

This will produce an `app-release-bundle.aab` file. This is the official Android App Bundle format required by the Google Play Store.

---

## Step 5: Upload to Google Play Console
1. Log in to the [Google Play Console](https://play.google.com/console).
2. Create a new App (Grade Master).
3. Fill out the Store Listing (Description, Screenshots, Hi-res icon).
   - *Tip: Use the PWA screenshots already defined in your manifest.*
4. Complete the Content Rating questionnaire.
5. Go to **Production** > **Create new release**.
6. Upload your `app-release-bundle.aab` file.
7. Provide release notes and click **Save**.
8. Roll out to production.

---

## Important Production Considerations for TWA

### 1. Offline Support (Verified)
The Google Play Store requires TWAs to handle offline scenarios gracefully (without showing the default Chrome offline dinosaur). Grade Master's `vite-plugin-pwa` configuration already caches the `index.html` and static assets, ensuring a fast, app-like offline experience.

### 2. Google OAuth Integration in TWA
When users launch a TWA, they are technically in a Chrome Custom Tab. Standard Google OAuth via popups works seamlessly inside a TWA, sharing the session state with the user's primary Android Chrome browser. No special native SDKs are required.

### 3. Subscriptions & Payments in TWA
Currently, Grade Master uses Yoco. Since TWAs run in a browser context, Yoco Checkout will function normally. However, Google Play policies dictate that *digital goods* sold within apps distributed through the Play Store must use Google Play Billing.
- **Action Required if rejecting Play Billing**: If your content is purely educational software services, you may be required to integrate Google Play Billing API for digital purchases or keep Yoco strictly for physical/external goods. If Play Billing is strictly required by reviewers, consider Bubblewrap's [Play Billing integration](https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/play-billing).
