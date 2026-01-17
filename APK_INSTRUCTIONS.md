# How to Build Your APK (Android App)

Since the automated build on this machine is having network issues, the most reliable way to get your APK is to build it using **Android Studio** on your computer.

## Prerequisites
- Download and Install [Android Studio](https://developer.android.com/studio).

## Step-by-Step Guide

### 1. Open the Project
1.  Launch **Android Studio**.
2.  Click **"Open"** (or "Open an existing Android Studio project").
3.  Navigate to your project folder:
    `Documents/healthcare-superapp/frontend/android`
4.  Click **OK** / **Open**.

### 2. Wait for Sync
*   Android Studio will start "syncing" the project. You will see progress bars at the bottom right.
*   **Wait** until it finishes. It might take a few minutes to download necessary tools (Gradle, SDKs) automatically.

### 3. Build the APK
1.  Go to the top menu bar.
2.  Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3.  Wait for the build to complete.

### 4. Locate the File
1.  Once finished, a small popup will appear at the bottom right saying "APK(s) generated successfully".
2.  Click **"locate"** in that popup.
3.  It will open a folder containing `app-debug.apk`.
4.  **Transfer this file to your phone** and install it!

---

## Troubleshooting
*   **"SDK Location not found":** If it asks for the Android SDK, go to **File > Settings > Languages & Frameworks > Android SDK** and make sure it's installed.
*   **"Gradle Sync Failed":** Click "Try Again" or "Sync Project with Gradle Files" (the elephant icon).
