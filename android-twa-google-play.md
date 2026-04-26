# M8 Painting Tools Android Wrapper Flow

This guide prepares `M8 Painting Tools` for Google Play using a Trusted Web Activity (TWA) built with Bubblewrap.

Production URLs for this setup:

- Start URL: `https://m8paintingtools.com/`
- Manifest URL: `https://m8paintingtools.com/manifest.json`
- Digital Asset Links URL: `https://m8paintingtools.com/.well-known/assetlinks.json`

## 1. Install Bubblewrap

Prerequisites:

1. Install the current LTS version of Node.js.
2. Install Android Studio once, or at minimum the Android SDK command-line tools.
3. Make sure Java is available. Bubblewrap can also help fetch dependencies on first run.

Install Bubblewrap globally:

```bash
npm install -g @bubblewrap/cli
```

Check the install:

```bash
bubblewrap --version
```

## 2. Run `bubblewrap init`

Create a new folder for the Android wrapper outside the Netlify site root, for example:

```bash
mkdir m8-painting-tools-android
cd m8-painting-tools-android
```

Initialize the Android wrapper from the live manifest:

```bash
bubblewrap init --manifest="https://m8paintingtools.com/manifest.json"
```

Recommended answers during init:

1. App name: `M8 Painting Tools`
2. Start URL: keep `https://m8paintingtools.com/`
3. Launcher name: `M8 Painting Tools`
4. Package id: choose a stable reverse-domain id you control, for example:
   `com.m8paintingtools.app`
5. Display mode: keep the manifest value `standalone`
6. Signing key:
   - If this is the first release, let Bubblewrap create one
   - Store the keystore and passwords safely because updates must use the same upload key

When init finishes, Bubblewrap generates an Android wrapper project and a `twa-manifest.json` file.

## 3. Build the Android App Bundle (`.aab`)

From the Bubblewrap project folder:

```bash
bubblewrap build
```

Bubblewrap will generate release artifacts. For Google Play, use the `.aab` output.

If Bubblewrap asks to install missing dependencies on first run, allow it.

Before upload, also test locally if possible:

```bash
bubblewrap install
```

That helps confirm the TWA opens your production site correctly on a device.

## 4. Set up Digital Asset Links

TWA fullscreen verification depends on Digital Asset Links. Without it, the app falls back to a Custom Tab with browser UI.

### 4.1 Get your package name

Use the exact package name you chose during `bubblewrap init`, for example:

```text
com.m8paintingtools.app
```

### 4.2 Get the SHA-256 fingerprint

For Google Play release verification, use the **App signing key certificate** fingerprint from Google Play Console, not just your local upload key.

Path in Play Console:

`Play Console -> App -> Setup -> App integrity`

Copy the **SHA-256 certificate fingerprint** from the **App signing key certificate** section.

### 4.3 Create the real file

Create this file on your site:

`https://m8paintingtools.com/.well-known/assetlinks.json`

Use this exact structure:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.m8paintingtools.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:..."
      ]
    }
  }
]
```

A template is included in this repo at:

- `.well-known/assetlinks.json.example`

Replace:

1. `package_name`
2. `sha256_cert_fingerprints`

Then deploy it as:

- `/.well-known/assetlinks.json`

### 4.4 Verify the hosted file

After deployment, open:

- `https://m8paintingtools.com/.well-known/assetlinks.json`

Make sure:

1. It returns HTTP 200
2. The response is valid JSON
3. There are no redirects to HTML

## 5. Upload the `.aab` to Google Play Console

1. Open [Google Play Console](https://play.google.com/console).
2. Create a new app.
3. App name: `M8 Painting Tools`
4. Default language: choose your storefront language
5. App or game: `App`
6. Free or paid: choose according to your store plan

Then:

1. Go to `Test and release`
2. Start with an internal testing track
3. Create a new release
4. Upload the generated `.aab`
5. Save and review release
6. Publish to internal testing first

After upload:

1. Wait for Play to process the bundle
2. Open `App integrity`
3. Copy the **App signing key certificate** SHA-256 fingerprint
4. Update `/.well-known/assetlinks.json` on your domain if needed
5. Re-test the installed app to confirm fullscreen TWA verification

## Submission checklist

Before production rollout, confirm:

1. `https://m8paintingtools.com/manifest.json` loads correctly
2. `https://m8paintingtools.com/.well-known/assetlinks.json` loads correctly
3. The installed app opens fullscreen without browser chrome
4. Stripe checkout still opens exactly as it does on the web
5. `?unlocked=true` still persists unlock state as before
6. All existing routes and localStorage behavior work unchanged
7. The Play listing includes privacy policy and required store metadata

## Notes specific to this repo

This setup keeps the current Netlify PWA behavior unchanged.

Helper files added for the Android wrapper flow:

1. `manifest.json`
   - A JSON manifest alias for Bubblewrap init
2. `.well-known/assetlinks.json.example`
   - A deployable template for Digital Asset Links
3. `android-twa-google-play.md`
   - This step-by-step guide
