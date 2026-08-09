# Google Keep API: OAuth Verification & Scope Configuration Guide

This guide provides a step-by-step checklist to configure, validate, and verify the restricted Google Keep API scopes (`https://www.googleapis.com/auth/keep`) within the Google Cloud Console. Following these steps will resolve OAuth 400 errors related to unverified apps and restricted scopes, allowing you to deploy the Google Keep integration to public production users.

## Understanding the Requirement
The Google Keep API uses **restricted scopes**. If your application requests `https://www.googleapis.com/auth/keep` or `https://www.googleapis.com/auth/keep.readonly`, Google requires your app to undergo a strict verification process, including a security assessment (CASA), before standard consumer accounts can grant these permissions.

If you don't complete this process, users will encounter an **OAuth 400 error (invalid_scope)** or an "App not verified" warning.

---

## Step 1: Enable the Google Keep API
Before configuring OAuth, you must enable the API in your Google Cloud Project.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select the project associated with Grade Master.
3. In the left navigation menu, go to **APIs & Services** > **Library**.
4. Search for **Google Keep API**.
5. Click on the API and click **Enable**.

---

## Step 2: Configure the OAuth Consent Screen
You need to set up how your app presents itself to users during the login flow.

1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** as the user type (since your app targets standard consumers).
3. Click **Create**.
4. Fill in the **App Information**:
   - **App name**: Grade Master
   - **User support email**: `grademaster.appointments@gmail.com`
   - **App logo**: Upload your official app logo.
5. Fill in the **App domain** links (Crucial for verification):
   - **Application home page**: `https://ais-pre-px3cca2y37hk6xugu6tyhg-1007192288317.europe-west2.run.app` (or your custom domain)
   - **Application privacy policy link**: Create and host a clear privacy policy page detailing what data you collect and why you need Google Keep access. (e.g., `https://yourdomain.com/privacy`)
   - **Application terms of service link**: Link to your Terms of Service.
6. Add your **Authorized domains** (e.g., `run.app` or your custom production domain).
7. Add `grademaster.appointments@gmail.com` to **Developer contact information**.
8. Click **Save and Continue**.

---

## Step 3: Add the Restricted Scopes
This is where you explicitly request the Google Keep permissions.

1. On the **Scopes** step of the consent screen configuration, click **Add or Remove Scopes**.
2. Search for the Keep scopes or manually add:
   - `https://www.googleapis.com/auth/keep`
   - `https://www.googleapis.com/auth/keep.readonly` (if needed)
3. Since these are **Restricted Scopes**, you will be prompted to justify why your app needs them.
4. **Justification**: Write a clear, concise justification explaining that Grade Master uses Google Keep to allow students to create, read, and sync their study notes and flashcards directly between the educational platform and their personal Google Keep accounts for seamless cross-device studying.
5. Click **Save and Continue**.

---

## Step 4: Prepare Verification Assets & Brand Audit
Because you are requesting restricted scopes, Google requires specific evidence of how your app uses the data and strict adherence to brand guidelines.

1. **Brand Audit Requirements**: Your application MUST comply with Google's branding guidelines to pass the OAuth consent screen verification.
   - The app name must accurately reflect your application's identity and cannot include "Google", "Keep", or other Google trademarks in a misleading way.
   - The app logo must be clear, represent your brand, and must NOT resemble any Google logos.
   - The home page URL and Privacy Policy URL must be on a verified domain that you own (using Google Search Console).
   - Ensure your consent screen accurately describes what your application does.

2. **Privacy Policy**: Ensure your privacy policy explicitly states:
   - How your app accesses, uses, stores, or shares Google Keep data.
   - That your use of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).

3. **Demo Video**: Record a screencast showing:
   - How a user logs into your app.
   - The OAuth consent screen displaying the app name and requested Keep scopes.
   - The user successfully granting access.
   - How the app uses the Keep data in the UI (e.g., fetching notes, creating a new study note).
   - Upload this video to YouTube (it can be Unlisted) and keep the URL handy.

---

## Step 5: Submit for Verification
Once your consent screen is fully configured and your assets are ready, you can submit the app.

1. Review the summary on the final step of the OAuth consent screen setup.
2. Click **Submit for Verification**.
3. Fill out the verification form provided by the Google Trust & Safety team.
4. Provide the link to your Demo Video.
5. Provide your justification for the restricted scopes.

### Important: Security Assessment (CASA)
Because `https://www.googleapis.com/auth/keep` is a restricted scope, Google will likely require a **Cloud Application Security Assessment (CASA)**.
- You will receive an email from Google detailing the Tier 2 or Tier 3 CASA requirements.
- This involves an independent security review of your application architecture, penetration testing, and data handling practices.
- This process can take several weeks and may involve costs if a third-party assessor is required.

---

## Step 6: Bypassing the Error During Testing (Test Users)
While you are waiting for verification, you can bypass the OAuth 400 error for specific developers and beta testers.

1. Go to **APIs & Services** > **OAuth consent screen**.
2. Scroll down to the **Test users** section.
3. Click **Add Users**.
4. Enter the Google account email addresses of your developers and testers.
5. Click **Save**.

*Note: Test users will still see an "App isn't verified" warning screen during login, but they can click "Advanced" -> "Go to Grade Master (unsafe)" to bypass it and grant the Keep scopes. The total limit is 100 test users.*

---

## Fallback Mechanism (Current State)
Currently, Grade Master is equipped with a robust **Firestore Fallback Mechanism**.
If a user declines the Keep scope, or if the Keep API returns an error (e.g., due to unverified status for a non-test user), the app will automatically switch to using Firebase Firestore to store notes under the user's profile securely.

If you decide the CASA security assessment for the Google Keep API is too burdensome, you can:
1. Remove the Keep scopes from `src/lib/firebase.ts`.
2. Rely entirely on the secure GradeMaster Cloud Backup (Firestore) for note-taking.
