# Google Play Store Submission Guide for Lunaria

This guide will walk you through the complete process of submitting your Lunaria app to the Google Play Store.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Submission Checklist](#pre-submission-checklist)
3. [Configure App for Production](#configure-app-for-production)
4. [Set Up App Signing](#set-up-app-signing)
5. [Build Production App](#build-production-app)
6. [Prepare Store Listing Assets](#prepare-store-listing-assets)
7. [Google Play Console Setup](#google-play-console-setup)
8. [Submit Your App](#submit-your-app)
9. [Post-Submission](#post-submission)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Google Play Developer Account
- **Cost**: One-time $25 registration fee
- **Sign up**: Visit [Google Play Console](https://play.google.com/console)
- **Required**: Google account, payment method, developer information
- **Processing time**: Usually instant, but can take up to 48 hours

### 2. EAS Account Setup
- Ensure you have an Expo account: `louislam09`
- Install EAS CLI globally (if not already installed):
  ```bash
  npm install -g eas-cli
  ```
- Login to EAS:
  ```bash
  eas login
  ```

### 3. Required Information
Before starting, gather:
- **App Name**: Lunaria
- **Package Name**: `com.louislam09.lunaria` (production)
- **App Category**: Health & Fitness / Medical
- **Target Audience**: 18+ (for health/medical apps)
- **Privacy Policy URL**: (Required for apps handling user data)
- **Support Email**: Your support email address

---

## Pre-Submission Checklist

- [ ] App is fully tested on multiple Android devices
- [ ] All features work correctly
- [ ] No debug code or console logs in production build
- [ ] Privacy Policy is created and hosted online
- [ ] App icon and splash screen are production-ready
- [ ] App version is set correctly (currently: 1.0.0)
- [ ] All required permissions have proper justifications
- [ ] App handles edge cases and errors gracefully
- [ ] Content rating questionnaire completed

---

## Configure App for Production

### Step 1: Update app.config.ts

**Current Issue**: `IS_DEV` is hardcoded to `true`. You need to change this for production builds.

1. Open `app.config.ts`
2. Change line 14:
   ```typescript
   // Change from:
   const IS_DEV = true;
   
   // To:
   const IS_DEV = process.env.APP_VARIANT === 'development';
   ```

This ensures production builds use the correct package name (`com.louislam09.lunaria`) instead of the dev version.

### Step 2: Verify Production Configuration

Ensure your `app.config.ts` production settings are correct:
- **Package Name**: `com.louislam09.lunaria`
- **App Name**: `Lunaria` (not "Lunaria (Dev)")
- **Version**: `1.0.0` (or your desired version)
- **Icon**: `./assets/images/icon.png` exists and is 1024x1024px
- **Adaptive Icon**: `./assets/images/adaptive-icon.png` exists

### Step 3: Update Android Build Configuration (if needed)

Your `android/app/build.gradle` currently has:
- `namespace 'com.louislam09.lunaria.dev'`
- `applicationId 'com.louislam09.lunaria.dev'`

**Note**: These will be automatically updated by Expo/EAS when building with `APP_VARIANT=production`, but verify after your first production build.

---

## Set Up App Signing

### Option A: Let Google Play Manage Your Signing Key (Recommended)

This is the easiest and most secure option. Google Play will generate and manage your signing key.

1. **First Build**: Build your app with EAS (it will create a keystore automatically)
2. **Upload**: Upload the AAB to Google Play Console
3. **Enable App Signing**: Google Play will prompt you to enable app signing by Google Play
4. **Accept**: Accept the prompt - Google will manage your key from then on

### Option B: Use Your Own Keystore (Advanced)

If you prefer to manage your own keystore:

1. **Generate a keystore** (if you don't have one):
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore lunaria-release.keystore -alias lunaria-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Store credentials securely**:
   - Never commit the keystore to git
   - Store credentials in a password manager
   - Keep backups in secure locations

3. **Configure EAS** to use your keystore:
   ```bash
   eas credentials
   ```
   Select Android → Production → Set up credentials → Upload keystore

---

## Build Production App

### Step 1: Ensure You're Logged In
```bash
eas login
```

### Step 2: Build Production AAB (Android App Bundle)

**Important**: Google Play requires AAB format, not APK.

```bash
npm run build:production
```

Or directly:
```bash
eas build --platform android --profile production
```

**Build Time**: Usually 15-30 minutes

**What happens**:
- EAS builds your app in the cloud
- Creates an Android App Bundle (AAB) file
- Signs it with your production keystore
- Uploads it to EAS servers

### Step 3: Download Your Build

After the build completes:

1. Visit: https://expo.dev/accounts/louislam09/projects/lunaria/builds
2. Find your production build
3. Download the `.aab` file
4. **Keep this file safe** - you'll need it for submission

### Step 4: Test Your Build (Optional but Recommended)

Before submitting, test the production build:

1. Download the AAB
2. Convert to APK for testing (optional):
   ```bash
   bundletool build-apks --bundle=app-release.aab --output=app.apks --mode=universal
   ```
3. Install on a test device
4. Verify everything works correctly

---

## Prepare Store Listing Assets

Google Play requires several assets for your store listing. Prepare these before submission:

### Required Assets

#### 1. App Icon
- **Size**: 512x512px (PNG, 32-bit)
- **File**: `assets/images/icon.png`
- **Requirements**: No transparency, square, high quality

#### 2. Feature Graphic
- **Size**: 1024x500px (PNG or JPG)
- **Purpose**: Banner shown at the top of your store listing
- **Requirements**: No text overlay (Google adds app name), represents your app

#### 3. Screenshots
- **Minimum**: 2 screenshots
- **Recommended**: 4-8 screenshots
- **Sizes Required**:
  - Phone: 16:9 or 9:16 aspect ratio, min 320px, max 3840px
  - Tablet (optional): 7" and 10" tablet screenshots
- **Requirements**: 
  - Show actual app UI
  - No device frames needed (Google adds them)
  - Show key features

#### 4. Short Description
- **Length**: Maximum 80 characters
- **Example**: "Track your menstrual cycle, predict periods, and manage your reproductive health with ease."

#### 5. Full Description
- **Length**: Maximum 4000 characters
- **Should include**:
  - What your app does
  - Key features
  - Benefits to users
  - How to use it
- **Formatting**: Use line breaks, bullet points, emojis (sparingly)

#### 6. Privacy Policy
- **Required**: Yes (your app handles health data)
- **Must include**:
  - What data you collect
  - How you use it
  - How you store it
  - Third-party services used
  - User rights
- **Hosting**: Must be publicly accessible URL
- **Example services**: GitHub Pages, Netlify, your own website

### Optional Assets

- **Promotional Video**: YouTube link (optional but recommended)
- **Tablet Screenshots**: If your app supports tablets
- **TV Screenshots**: If your app supports Android TV
- **Wear OS Screenshots**: If your app supports Wear OS

### Content Rating

You'll need to complete a content rating questionnaire:

1. **Access**: Google Play Console → App Content → Content Rating
2. **Answer questions** about:
   - User-generated content
   - Violence, sexual content, etc.
   - Gambling, alcohol, etc.
3. **For Health Apps**: Usually rated "Everyone" or "Teen" depending on content

---

## Google Play Console Setup

### Step 1: Create Your App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name**: Lunaria
   - **Default language**: English (or your primary language)
   - **App or game**: App
   - **Free or paid**: Free (or Paid if applicable)
   - **Declarations**: Check all that apply (Ads, etc.)
4. Click **"Create app"**

### Step 2: Complete Store Listing

1. Navigate to **"Store presence" → "Main store listing"**
2. Fill in all required fields:

   **App Details**:
   - App name: Lunaria
   - Short description: (80 chars max)
   - Full description: (4000 chars max)
   - App icon: Upload 512x512px icon
   - Feature graphic: Upload 1024x500px banner

   **Graphics**:
   - Phone screenshots: Upload 2-8 screenshots
   - Tablet screenshots: (Optional)
   - Promotional video: (Optional)

   **Categorization**:
   - App category: Health & Fitness (or Medical)
   - Tags: (Optional keywords)

   **Contact Details**:
   - Email: Your support email
   - Phone: (Optional)
   - Website: (Optional)

   **Privacy Policy**:
   - Privacy Policy URL: (Required - must be publicly accessible)

### Step 3: Set Up App Content

1. **Content Rating**:
   - Complete the questionnaire
   - Wait for rating (usually instant)

2. **Target Audience**:
   - Select appropriate age groups
   - For health apps: Usually 18+

3. **Data Safety**:
   - Declare what data you collect
   - Required sections:
     - Data collection (health data, personal info, etc.)
     - Data sharing practices
     - Security practices
   - **Important**: Be accurate - Google reviews this

4. **Ads**:
   - Declare if you show ads
   - If yes, provide ad network information

5. **COVID-19 Contact Tracing and Status Apps**:
   - Answer if applicable

### Step 4: Set Up Pricing and Distribution

1. **Pricing**:
   - Set as Free or Paid
   - If paid, set price per country

2. **Countries/Regions**:
   - Select where to distribute
   - Can start with specific countries or "All countries"

3. **Device Categories**:
   - Phone: ✓ (if supported)
   - Tablet: ✓ (if `supportsTablet: true`)
   - TV: ✗ (unless supported)
   - Wear OS: ✗ (unless supported)
   - Chrome OS: ✗ (unless supported)

4. **User Programs**:
   - Early Access: (Optional)
   - Beta Testing: (Recommended for initial testing)

---

## Submit Your App

### Step 1: Create a Release

1. Go to **"Production" → "Create new release"**
2. You'll see a form to upload your AAB

### Step 2: Upload Your AAB

1. **Upload AAB**:
   - Click "Upload" or drag and drop your `.aab` file
   - Wait for upload to complete
   - Google will analyze your app (may take a few minutes)

2. **Release Name** (optional):
   - Example: "1.0.0 - Initial Release"
   - Or leave blank for automatic naming

3. **Release Notes**:
   - What's new in this version
   - Example: "Initial release of Lunaria - Track your menstrual cycle and manage your reproductive health"

### Step 3: Review and Rollout

1. **Review the Release**:
   - Check version code and version name
   - Verify AAB details
   - Review release notes

2. **Rollout Options**:
   - **Production**: Full release to all users
   - **Staged Rollout**: Gradual release (recommended for first release)
     - Start with 20% of users
     - Monitor for issues
     - Gradually increase to 100%

3. **Review Checklist**:
   - [ ] Store listing is complete
   - [ ] Content rating is complete
   - [ ] Data safety form is complete
   - [ ] Privacy policy is accessible
   - [ ] App is tested and working
   - [ ] All required graphics are uploaded

### Step 4: Submit for Review

1. Click **"Save"** or **"Review release"**
2. Review all sections:
   - Store listing: ✓ Complete
   - App content: ✓ Complete
   - Pricing & distribution: ✓ Complete
   - Content rating: ✓ Complete
   - Data safety: ✓ Complete

3. Click **"Start rollout to Production"** (or "Send for review" if using staged rollout)

### Step 5: Wait for Review

- **Review Time**: Usually 1-3 days, can take up to 7 days
- **Status**: Check in Google Play Console
- **Notifications**: You'll receive email updates

**Common Review Outcomes**:
- ✅ **Approved**: App goes live
- ⚠️ **Rejected**: Fix issues and resubmit
- 📝 **More Information Needed**: Respond to Google's questions

---

## Post-Submission

### After Approval

1. **Monitor Your App**:
   - Check Google Play Console regularly
   - Monitor crash reports
   - Read user reviews
   - Check analytics

2. **Respond to Reviews**:
   - Engage with users
   - Address concerns
   - Thank positive reviewers

3. **Monitor Performance**:
   - Install numbers
   - Rating trends
   - Crash-free rate
   - ANR (App Not Responding) rate

### Updating Your App

When you need to release an update:

1. **Update Version**:
   - Increment version in `app.config.ts`:
     ```typescript
     version: '1.0.1', // or '1.1.0' for major updates
     ```

2. **Build New Version**:
   ```bash
   npm run build:production
   ```

3. **Create New Release**:
   - Go to Google Play Console
   - Create new release
   - Upload new AAB
   - Add release notes
   - Submit for review

### Using EAS Submit (Alternative Method)

You can also submit directly from the command line:

1. **Configure submit profile** (already done in `eas.json`):
   ```json
   "submit": {
     "production": {
       "android": {
         "track": "production"
       }
     }
   }
   ```

2. **Submit your build**:
   ```bash
   eas submit --platform android --profile production
   ```

   This will:
   - Use your latest production build
   - Upload directly to Google Play
   - Create a release automatically

---

## Troubleshooting

### Common Issues

#### 1. Build Fails
- **Check**: EAS login status (`eas whoami`)
- **Check**: Project ID matches in `app.config.ts`
- **Check**: All dependencies are compatible
- **Solution**: Review build logs in Expo dashboard

#### 2. Package Name Mismatch
- **Issue**: App uses dev package name instead of production
- **Solution**: Ensure `IS_DEV` is set correctly in `app.config.ts`
- **Verify**: Check built AAB package name

#### 3. Missing Permissions Justification
- **Issue**: Google requires justification for sensitive permissions
- **Solution**: Add permission explanations in Google Play Console → App Content → Data Safety

#### 4. Privacy Policy Required
- **Issue**: App rejected due to missing privacy policy
- **Solution**: Create and host a privacy policy, add URL to store listing

#### 5. Content Rating Issues
- **Issue**: Rating doesn't match app content
- **Solution**: Review and update content rating questionnaire

#### 6. AAB Too Large
- **Issue**: App bundle exceeds size limits
- **Solution**: 
  - Enable app bundle compression
  - Remove unused assets
  - Use Android App Bundle's dynamic delivery features

#### 7. Version Code Conflicts
- **Issue**: Version code already exists
- **Solution**: EAS auto-increment handles this, but if manual: increment `versionCode` in `build.gradle`

### Getting Help

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Google Play Help**: https://support.google.com/googleplay/android-developer
- **Expo Forums**: https://forums.expo.dev/

---

## Quick Reference Commands

```bash
# Login to EAS
eas login

# Check login status
eas whoami

# Build production AAB
npm run build:production
# or
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --profile production

# View builds
# Visit: https://expo.dev/accounts/louislam09/projects/lunaria/builds

# Update app (after version bump)
npm run build:production
eas submit --platform android --profile production
```

---

## Important Notes

1. **First Submission**: Can take longer to review (up to 7 days)
2. **Updates**: Usually reviewed faster (1-2 days)
3. **Staged Rollout**: Recommended for first release to catch issues early
4. **Version Codes**: Must always increase - EAS handles this automatically
5. **Keystore**: Keep your keystore safe - losing it means you can't update your app
6. **Privacy Policy**: Required for apps handling user data (health data = required)
7. **Data Safety**: Must accurately reflect what data you collect and how you use it

---

## Next Steps After Reading This Guide

1. ✅ Update `app.config.ts` to fix `IS_DEV` flag
2. ✅ Create/verify privacy policy is hosted online
3. ✅ Prepare store listing assets (screenshots, descriptions, etc.)
4. ✅ Test your app thoroughly
5. ✅ Build production AAB
6. ✅ Set up Google Play Console account (if not done)
7. ✅ Complete store listing
8. ✅ Submit for review

Good luck with your submission! 🚀

