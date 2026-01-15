# Social Login Setup Instructions

## CRITICAL: Security Warning
**NEVER** put your API Secrets (Twitter Consumer Secret, Facebook App Secret) inside your application code (e.g., `firebase.ts` or `app.json`). If you do, anyone can steal your credentials and impersonate your app.
These secrets must **ONLY** be entered in the **Firebase Console**.

---

## Step 1: Fix `firebase.ts` Configuration

Your `config/firebase.ts` file currently lists your **Twitter API Key** as the Firebase API Key. This will prevent your app from starting.

You need to find your **Firebase Web API Key** and **App ID**:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your project **knews-2d1bd**.
3. Click the **Gear Icon** (Project Settings) > **General**.
4. Scroll down to "Your apps".
5. Copy the `apiKey` (starts with `AIza...`) and `appId` (starts with `1:...`).
6. Update the `firebaseConfig` object in `d:\8knews\config\firebase.ts` with these correct values.

---

## Step 2: Configure Twitter Login

1. Go to [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Sign-in method**.
2. Click on **Twitter** (or Add new provider).
3. Enable it.
4. Enter the values you provided:
   - **API Key**: `ySRV4CZxyihhQDVIq40B00a8A`
   - **API Secret**: `tDmSuqktXx2rBjfA9hH1GivhxMtshhyWQrBrgGwy1ylDeiXrug`
5. Copy the **Callback URL** shown in Firebase (it should match: `https://knews-2d1bd.firebaseapp.com/__/auth/handler`).
6. Save.

**Twitter Developer Portal:**
Ensure the Callback URL above is added to your Twitter App settings under "User authentication settings".

---

## Step 3: Configure Facebook Login

1. Go to [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Sign-in method**.
2. Click on **Facebook** (or Add new provider).
3. Enable it.
4. Enter the values you provided:
   - **App ID**: `1906698630240572`
   - **App Secret**: `f90b48927edf38ef40ce5cbabbf69d2e`
5. Copy the **OAuth redirect URI** shown in Firebase (same as above).
6. Save.

**Meta for Developers (Facebook):**
Ensure the Redirect URI is added to your Facebook App > **Facebook Login** > **Settings** > **Valid OAuth Redirect URIs**.

---

## Step 4: Configure Google Login

1. Go to [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Sign-in method**.
2. Click on **Google**.
3. Enable it.
4. Usually, no extra keys are needed for basic implementation, but ensure your support email is selected.
5. Save.

---

## Summary
Once you have entered these keys in the **Firebase Console**, your code in `firebase.ts` (using `signInWithPopup`) will automatically work without needing the Twitter/Facebook secrets in your codebase.
