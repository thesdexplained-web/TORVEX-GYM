# 🏋️‍♂️ TORVEX GYM - Professional Flutter Application

> **Production-grade, Cross-Platform Fitness & Biomechanics Tracking Engine built in Flutter & Dart with BLoC Architecture.**

---

## 🚀 Key Architectural Features
- **State Management:** Strict **BLoC Pattern** (`flutter_bloc`, Event-Driven State Streams).
- **Offline First & Cloud Sync:** Real-time Firebase Cloud Firestore integration with offline fallback queue via `shared_preferences`.
- **Local Notifications:** In-app and lockscreen rest timers, workout reminders, and achievement celebration alerts via `flutter_local_notifications`.
- **Monetization & Paywall:** Torvex Pro subscription tiers (Monthly / Annual) with full feature gating.
- **Biomechanical AI Coach:** Interactive fitness consultation and dynamic workout suggestions.
- **Cross-Platform:** Responsive scaling for Android, iOS, and Web.

---

## 🛠️ How to Run & Test Instantly

### 1. Requirements
- Flutter SDK `>= 3.2.0` (Install from [flutter.dev](https://flutter.dev))
- Android Studio or Visual Studio Code with Flutter extension.

### 2. Quick Start
```bash
# Clone or unzip the project
cd torvex_gym_flutter

# Install all pub packages
flutter pub get

# Run on connected device, emulator, or Chrome (Web)
flutter run
```

### 3. Connect Your Real Firebase
This project is configured to connect with the Torvex Firebase database (`ai-studio-torvexgym-a35a5a32-9d5d-45ca-9f8c-6578998ca908`).
To regenerate platform-specific files:
```bash
flutterfire configure
```
Or place your `google-services.json` inside `android/app/` and `GoogleService-Info.plist` in `ios/Runner/`.

### 4. Build for Stores
- **Android APK (Play Store):**
  ```bash
  flutter build appbundle --release
  ```
- **iOS IPA (App Store):**
  ```bash
  flutter build ipa --release
  ```
