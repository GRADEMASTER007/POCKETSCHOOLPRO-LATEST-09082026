# Google Cloud Run & Firebase Deployment Guide
## Grade Master Africa – Pocket School Pro (Gold Edition)

This guide details deployment procedures for **Grade Master Africa – Pocket School Pro** on Google Cloud Run and Firebase, including Vertex AI & Gemini API configuration, Firebase Firestore & Rules setup, and production verification pipelines.

---

## 1. GCP Prerequisites & Service Account

1. **Set Google Cloud Project**:
   ```bash
   gcloud config set project [YOUR_PROJECT_ID]
   ```

2. **Enable Required GCP APIs**:
   ```bash
   gcloud services enable run.googleapis.com \
                          containerregistry.googleapis.com \
                          artifactregistry.googleapis.com \
                          secretmanager.googleapis.com \
                          aiplatform.googleapis.com \
                          vision.googleapis.com
   ```

3. **Create Dedicated Service Account**:
   ```bash
   gcloud iam service-accounts create pocket-school-runner \
       --description="Runner for Grade Master Africa Cloud Run container" \
       --display-name="Grade Master Runner"
   ```

4. **Assign IAM Roles**:
   ```bash
   gcloud projects add-iam-policy-binding [YOUR_PROJECT_ID] \
       --member="serviceAccount:pocket-school-runner@[YOUR_PROJECT_ID].iam.gserviceaccount.com" \
       --role="roles/aiplatform.user"

   gcloud projects add-iam-policy-binding [YOUR_PROJECT_ID] \
       --member="serviceAccount:pocket-school-runner@[YOUR_PROJECT_ID].iam.gserviceaccount.com" \
       --role="roles/secretmanager.secretAccessor"
   ```

---

## 2. Secrets & Container Assembly

1. **Store Gemini API Key**:
   ```bash
   echo -n "YOUR_SECURE_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
       --data-file=- \
       --replication-policy="automatic"
   ```

2. **Submit Container Build**:
   ```bash
   gcloud builds submit --tag europe-west2-docker.pkg.dev/[YOUR_PROJECT_ID]/pocket-school-repo/pocket-school-app:latest .
   ```

---

## 3. Deploying to Cloud Run

```bash
gcloud run deploy grade-master-africa \
    --image=europe-west2-docker.pkg.dev/[YOUR_PROJECT_ID]/pocket-school-repo/pocket-school-app:latest \
    --region=europe-west2 \
    --service-account=pocket-school-runner@[YOUR_PROJECT_ID].iam.gserviceaccount.com \
    --set-env-vars="NODE_ENV=production,PORT=3000" \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --port=3000 \
    --allow-unauthenticated
```

---

## 4. Firebase Security Rules & Storage Deployment

1. **Deploy Firestore Security Rules**:
   Ensure `firestore.rules` is updated and deploy using the Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

---

## 5. Automated Production AI Probe & SEO Endpoints Check

1. **Verify Google Gemini 1.5 Pro & Vision API execution**:
   ```bash
   npm run test:ai
   ```

2. **Verify SEO & Crawler Endpoints**:
   - `GET https://[YOUR_DOMAIN]/sitemap.xml`
   - `GET https://[YOUR_DOMAIN]/robots.txt`
   - `GET https://[YOUR_DOMAIN]/api/seo/keyword-trends`

3. **Verify Yoco & Sponsorship Checkout Route**:
   - `POST https://[YOUR_DOMAIN]/api/create-checkout-session` (Plan IDs: `basic_49`, `plus_69`, `standard_99`, `gold_199`, `sponsor_*`, `donation_*`)

