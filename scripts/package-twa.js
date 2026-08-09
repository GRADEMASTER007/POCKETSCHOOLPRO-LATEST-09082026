#!/usr/bin/env node

/**
 * Grade Master - Automated TWA Packaging Script
 * This script automates the creation of a Trusted Web Activity (TWA) bundle
 * for publishing the Grade Master PWA to the Google Play Store using @google/bubblewrap.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const APP_URL = "https://ais-pre-px3cca2y37hk6xugu6tyhg-1007192288317.europe-west2.run.app";
const MANIFEST_URL = `${APP_URL}/manifest.json`;
const TWA_DIR = path.join(process.cwd(), "android-twa-build");

console.log("🚀 Starting Grade Master TWA Packaging Process...");

try {
  // 1. Check prerequisites
  console.log("📦 Checking for bubblewrap CLI...");
  try {
    execSync('npx @bubblewrap/cli --help', { stdio: 'ignore' });
  } catch (e) {
    console.log("Installing @bubblewrap/cli globally...");
    execSync('npm install -g @bubblewrap/cli', { stdio: 'inherit' });
  }

  // 2. Clean up previous builds
  console.log("🧹 Cleaning up any previous build directories...");
  if (fs.existsSync(TWA_DIR)) {
    fs.rmSync(TWA_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TWA_DIR, { recursive: true });

  // 3. Initialize Bubblewrap project
  console.log("⚙️ Initializing Bubblewrap project from manifest...");
  console.log("The CLI will now prompt you for configuration details.\n");
  console.log("RECOMMENDED SETTINGS FOR GRADE MASTER:");
  console.log("--------------------------------------");
  console.log(`Web app URL: ${APP_URL}`);
  console.log("Application Name: Grade Master");
  console.log("Short Name: GradeMaster");
  console.log("Package Name: com.grademaster.africa.twa");
  console.log("Display Mode: standalone");
  console.log("Theme Color: #0f172a");
  console.log("--------------------------------------\n");

  // Run bubblewrap init in the TWA directory
  execSync(`npx @bubblewrap/cli init --manifest="${MANIFEST_URL}"`, { 
    cwd: TWA_DIR,
    stdio: 'inherit' 
  });

  // 4. Build the Android bundle
  console.log("\n🔨 Building the Android App Bundle (AAB)...");
  console.log("NOTE: This step requires the Android SDK and JDK 11+ to be installed on your system.");
  console.log("You may be prompted to enter a password for your new Android Keystore.");
  console.log("⚠️ IMPORTANT: Keep your generated keystore and passwords safe! You will need them for future app updates.\n");

  execSync(`npx @bubblewrap/cli build`, { 
    cwd: TWA_DIR,
    stdio: 'inherit' 
  });

  console.log("\n✅ TWA Packaging Complete!");
  console.log(`Your Play Store-ready bundle is located at: ./${path.relative(process.cwd(), TWA_DIR)}/app-release-bundle.aab\n`);
  console.log("⏭️ NEXT STEPS:");
  console.log("1. Upload the .aab file to the Google Play Console under your new app release.");
  console.log("2. Generate your Digital Asset Links (assetlinks.json) using the SHA-256 fingerprint of your keystore.");
  console.log("3. Place the generated assetlinks.json file in the 'public/.well-known/' directory of this project.");
  console.log(`4. Deploy the web app so that the asset links file is accessible at ${APP_URL}/.well-known/assetlinks.json`);

} catch (error) {
  console.error("\n❌ An error occurred during the packaging process:");
  console.error(error.message);
  process.exit(1);
}
