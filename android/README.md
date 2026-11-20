# Jarvis for Android

This is the first native Android foundation added alongside the original React web workspace.

## Open in Android Studio
Open this `android/` directory as a project. Use JDK 17 and install Android SDK Platform 35. Gradle sync will download the Android Gradle Plugin and dependencies.

## Current prototype
- Jetpack Compose Jarvis home screen
- Speech input through Android's speech recognizer activity
- Speech output through Android TextToSpeech
- Accessibility service declaration (user must explicitly enable it in Android Settings)
- Initial app-launch / settings-intent executor

## Not yet implemented
- Live Grok conversation from this native screen
- Streaming voice conversation or wake word
- Full multi-step agent loop and server-validated tool calling
- Persistent encrypted long-term memory
- Calendar, email, messaging integrations

The chat response currently says that the native foundation is ready; it is a scaffold placeholder, not an AI response. Do not mistake this starter for a release-ready APK.

## Live AI connection (M1 foundation)
The native app now sends chat messages to the HTTPS endpoint `/api/jarvis/chat` on the existing TanStack Start backend. The xAI key remains on the server; it is never compiled into the Android app.

Configure these server environment variables before using live chat:

- `XAI_API_KEY`: your xAI API key (server-side only)
- `JARVIS_ACCESS_TOKEN`: a long, random secret shared with the app at connection time
- `XAI_MODEL`: optional model override; defaults to `grok-4.7` to match the existing workspace integration

Deploy the web workspace, then in Jarvis tap **AI 服务连接**, enter the deployed HTTPS origin (for example `https://your-domain.example`) and the `JARVIS_ACCESS_TOKEN`, and save. The token is held in app memory only and is not saved to device storage. The server endpoint rejects requests without the shared token and limits message/history lengths.

Do not use a public or guessed token. Set a unique random value in your hosting provider's secret/environment-variable settings. Rotate it if it is exposed. The app requires HTTPS; plain HTTP endpoints are rejected by the UI.

## Current M1 boundary
This adds real server-proxied text chat and spoken replies using Android TTS. It does not yet execute phone actions from AI output, stream tokens, or provide an always-on wake word. Phone control and sensitive-action confirmation remain separate milestones.

## Build the APK using only your Android phone
A GitHub Actions workflow is included at `.github/workflows/android-apk.yml`. After you upload this project to a GitHub repository using the GitHub Android app or mobile website, open the repository's **Actions** tab, run **Build Jarvis Android APK**, and wait for the workflow to finish. Open the successful run and download the `jarvis-debug-apk` artifact. This avoids installing Android Studio or using a computer. The APK is a debug build for testing, not a Play Store release.
