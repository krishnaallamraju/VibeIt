# 🎸 VibeIt - AI-Powered Real-Time Synchronized Smartphone Band

Turn multiple smartphones into one synchronized, AI-powered musical band. Join rooms, assign instruments (Drums, Synth Keyboard, Bass, AI Vocals, AI Bandmate), and perform live with zero perceptible latency across devices!

---

## 📲 Download Android APK

[![Download Android APK](https://img.shields.io/badge/Download-VibeIt.apk%20(4.11%20MB)-00E676?style=for-the-badge&logo=android&logoColor=white)](https://github.com/krishnaallamraju/VibeIt/raw/main/VibeIt.apk)

### ⬇️ **[Click Here to Download VibeIt.apk](https://github.com/krishnaallamraju/VibeIt/raw/main/VibeIt.apk)**

| Property | Details |
| :--- | :--- |
| **Direct Download URL** | [`https://github.com/krishnaallamraju/VibeIt/raw/main/VibeIt.apk`](https://github.com/krishnaallamraju/VibeIt/raw/main/VibeIt.apk) |
| **File Name** | `VibeIt.apk` |
| **File Size** | `4.11 MB` (`4,314,349 bytes`) |
| **Compatibility** | Android 7.0+ (API 24+) |
| **How to Install** | Download onto your phone, tap the file in Downloads, and tap **Install**. |

---

## 🌟 Key Features

- **🥁 AI Drums**: Multi-pad drum kit with realistic synthesis, physical tactile haptics on mobile, and accelerometer/gyroscope motion strike detection.
- **🎹 Polyphonic Synth Keyboard**: Low-latency ADSR synthesized piano and pads with harmonic chord triggers.
- **🎸 Bass Guitar**: Deep sub-bass, slap, and pluck synthesizers with fretboard simulation.
- **🎤 AI Vocals & Autotune**: Real-time microphone pitch detection engine with musical scale snapping (C Major, A Minor, Pentatonic, Chromatic).
- **🤖 AI Bandmate**: Generative accompanist co-pilot playing responsive rhythm and melodic accompaniment alongside human players.
- **⏱ Real-Time Synchronization**: Sub-millisecond phone-to-phone synchronization powered by custom NTP clock offset calculations and Socket.IO.
- **🎙 Performance Recording**: Live session recording with multi-track history playback and audio export.
- **📱 Android APK Integration**: Built with Capacitor for native Android deployment, tactile phone vibrations, and direct over-the-air APK distribution.

---

## 🏗 Architecture

```
VibeIt/
├── client/          # React Native / Expo Web frontend & Capacitor Android bridge
│   ├── android/     # Native Android project (Capacitor Bridge & Java runtime)
│   └── src/         # Web Audio API synths, audio engine, NTP clock & stage UI
├── server/          # Node.js, Express, Socket.IO & NTP master clock server
├── scripts/         # Automated APK build & ADB device installation scripts
└── VibeIt.apk       # Pre-built downloadable Android APK
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Run the Backend Master Server
```bash
npm run dev:server
```
The console will display:
```
======================================================
🎸 VibeIt Master Server & Web App is LIVE!
💻 Local access:      http://localhost:4000
📱 Mobile Wi-Fi URL:  http://<YOUR_LOCAL_IP>:4000
📦 Download APK link: http://<YOUR_LOCAL_IP>:4000/download-apk
======================================================
```

### 3. Run the Web Client (Optional for browser testing)
```bash
npm run start:client
```

---

## 📱 Building & Installing the Android APK

### Automated One-Step Build
```bash
npm run build:apk
```
This automatically exports the web bundle, syncs Capacitor plugins (`@capacitor/haptics`, `@capacitor/status-bar`), builds with Gradle, and places `VibeIt.apk` in the root folder.

### Install onto Connected Phone (USB ADB)
```bash
npm run install:apk
```

### Install Over Wi-Fi (No USB Cable Required)
1. Start the server on your computer: `npm run dev:server`
2. Open Chrome on your Android smartphone (connected to the same Wi-Fi) and visit:
   ```
   http://<YOUR_LOCAL_IP>:4000/download-apk
   ```
3. Tap the downloaded APK to install.

---

## 🛠 Tech Stack

- **Client**: React Native / Expo, Web Audio API, `@capacitor/android`, `@capacitor/haptics`, `@capacitor/status-bar`, Socket.IO client, TypeScript.
- **Server**: Node.js, Express, Socket.IO, TypeScript.
- **Native Android**: Android SDK, Java, Gradle.
