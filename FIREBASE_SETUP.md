# Firebase Authentication Setup Guide for 8K News

## Overview
This guide will help you complete the Firebase Authentication setup for your 8K News app with support for:
- Guest Login (Anonymous Authentication)
- Google Sign-In
- Facebook Login
- Twitter Login

## Prerequisites
- Firebase Project: `knews-2d1bd`
- Project Number: `823388850788`

## Step 1: Get Firebase Configuration Keys

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `knews-2d1bd`
3. Click on the gear icon (⚙️) → Project Settings
4. Scroll down to "Your apps" section
5. If you haven't added a web app, click "Add app" → Web (</>) icon
6. Register your app with nickname "8K News Web"
7. Copy the `firebaseConfig` object

## Step 2: Update Firebase Configuration

Open `config/firebase.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY", // From Firebase Console
  authDomain: "knews-2d1bd.firebaseapp.com",
  projectId: "knews-2d1bd",
  storageBucket: "knews-2d1bd.appspot.com",
  messagingSenderId: "823388850788",
  appId: "YOUR_ACTUAL_APP_ID" // From Firebase Console
};
```

## Step 3: Enable Authentication Methods in Firebase

### 3.1 Enable Anonymous Authentication (Guest Login)
1. In Firebase Console → Authentication → Sign-in method
2. Click on "Anonymous"
3. Toggle "Enable"
4. Click "Save"

### 3.2 Enable Google Sign-In
1. In Firebase Console → Authentication → Sign-in method
2. Click on "Google"
3. Toggle "Enable"
4. Set support email
5. Click "Save"

### 3.3 Enable Facebook Login
1. **In Facebook Developers:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create an app or use existing app
   - Add "Facebook Login" product
   - In Settings → Basic, copy your App ID and App Secret

2. **In Firebase Console:**
   - Authentication → Sign-in method
   - Click on "Facebook"
   - Toggle "Enable"
   - Paste Facebook App ID and App Secret
   - Copy the OAuth redirect URI: `https://knews-2d1bd.firebaseapp.com/__/auth/handler`

3. **Back in Facebook Developers:**
   - Go to Facebook Login → Settings
   - Add the OAuth redirect URI to "Valid OAuth Redirect URIs"
   - Save changes

### 3.4 Enable Twitter Login
1. **In Twitter Developer Portal:**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create an app or use existing app
   - In app settings, enable "3-legged OAuth"
   - Copy API Key and API Secret Key

2. **In Firebase Console:**
   - Authentication → Sign-in method
   - Click on "Twitter"
   - Toggle "Enable"
   - Paste Twitter API Key and API Secret
   - Copy the callback URL: `https://knews-2d1bd.firebaseapp.com/__/auth/handler`

3. **Back in Twitter Developer Portal:**
   - In app settings → Authentication settings
   - Add the callback URL
   - Set Website URL (can be your app's website)
   - Save changes

## Step 4: Update App Layout to Include AuthProvider

Open `app/_layout.tsx` and wrap your app with the AuthProvider:

```typescript
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your existing layout code */}
    </AuthProvider>
  );
}
```

## Step 5: Integrate Login Screen

In your `newsfeed.tsx` or wherever you want to show the login modal:

```typescript
import LoginScreen from '../components/LoginScreen';
import { useAuth } from '../contexts/AuthContext';

// In your component:
const { user, isGuest } = useAuth();

// Show login modal when needed:
{isLoginModalVisible && (
  <View style={styles.modalOverlay}>
    <LoginScreen 
      onClose={() => setIsLoginModalVisible(false)}
      onLoginSuccess={() => {
        setIsLoginModalVisible(false);
        // Handle successful login
      }}
    />
  </View>
)}
```

## Step 6: Test Authentication

### Test Guest Login:
1. Run the app
2. Click "అతిథిగా కొనసాగించండి" (Continue as Guest)
3. Verify anonymous user is created in Firebase Console → Authentication → Users

### Test Google Login:
1. Click "Google తో లాగిన్ అవ్వండి"
2. Complete Google sign-in flow
3. Verify user appears in Firebase Console

### Test Facebook Login:
1. Click "Facebook తో లాగిన్ అవ్వండి"
2. Complete Facebook login flow
3. Verify user appears in Firebase Console

### Test Twitter Login:
1. Click "Twitter తో లాగిన్ అవ్వండి"
2. Complete Twitter login flow
3. Verify user appears in Firebase Console

## Step 7: Using Authentication in Your App

Access user data anywhere in your app:

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isGuest, logout } = useAuth();

  if (!user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user.displayName || 'Guest'}</Text>
      {isGuest && <Text>You're using guest mode</Text>}
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Security Rules (Optional but Recommended)

In Firebase Console → Firestore Database → Rules, add:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### "Auth domain not whitelisted"
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your domain (for Expo: `*.exp.direct` and `*.expo.dev`)

### Facebook/Twitter login not working on mobile
- Ensure you've added the OAuth redirect URIs correctly
- For mobile apps, you may need to use deep linking
- Check that your app's bundle ID matches in Firebase and provider settings

### "signInWithPopup is not supported in this environment"
- For React Native, you'll need to use `signInWithRedirect` or implement native modules
- Consider using `expo-auth-session` for better mobile support

## Next Steps

1. ✅ Complete Firebase configuration with actual API keys
2. ✅ Enable all authentication methods in Firebase Console
3. ✅ Configure Facebook and Twitter apps
4. ✅ Wrap your app with AuthProvider
5. ✅ Test all login methods
6. ✅ Implement user profile features
7. ✅ Add logout functionality

## Support

For issues:
- Check Firebase Console → Authentication → Users to see if users are being created
- Check browser/app console for error messages
- Verify all redirect URIs are correctly configured
- Ensure API keys are not expired or restricted
