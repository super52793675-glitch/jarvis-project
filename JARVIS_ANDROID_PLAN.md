# Jarvis Android AI Life Agent — implementation notes

## Product decisions
- Platform: Android-first native application
- Assistant name: Jarvis
- Voice: selectable voices (system TTS voices initially; cloud voice provider later)
- Phone control: broad capability through Android intents, documented APIs, and user-enabled accessibility actions
- Safety: user consent, visible permission state, confirmation for sensitive actions

## Existing workspace assessment
The uploaded project is a React 19 + TypeScript + TanStack Start web application. It already contains:
- `src/components/assistant/use-engine.ts`: conversation lifecycle and intent execution orchestration
- `src/lib/assistant/intent.ts`: deterministic intent parsing and action splitting
- `src/lib/assistant/catalog.ts`: app catalogue and launch/search URLs
- `src/lib/assistant/speech.ts`: browser speech recognition and speech synthesis
- `src/lib/assistant/ai.functions.ts`: server-side xAI call; API key is read server-side from `XAI_API_KEY`
- `src/lib/assistant/store.ts`: local assistant state

It does not contain an Android Gradle project or Android native APIs. The `android/` folder added here is the first native foundation; the existing web app remains intact.

## Native foundation added
- Kotlin + Jetpack Compose Android application under `android/`
- Native assistant home/chat shell branded Jarvis
- Android speech recognition intent and system TextToSpeech baseline
- User-enabled AccessibilityService declaration and starter implementation for visible text click / gestures
- Allowlisted app-launch and settings-intent executor
- No API key is embedded in the APK

## Important implementation boundaries
1. AccessibilityService must be explicitly enabled by the device owner. Android documents this API for accessibility use; distribution must comply with Google Play accessibility policy and must not be used for covert surveillance or to bypass other apps' security controls.
2. A third-party app cannot promise unrestricted control of every app, protected screen, secure input, or OS setting. Prefer public intents and official APIs; use accessibility only for user-authorized UI assistance.
3. Android 14+ imposes while-in-use restrictions on microphone foreground services. An always-listening wake word is a separate milestone and must use a compliant foreground/voice-interaction design, visible notification, permission flow, and battery-aware settings. This starter does not claim always-on listening.
4. The native app currently uses on-device/system speech recognition UI and TTS. It does not yet connect its chat composer to the xAI backend; the visible response is an explicit scaffold placeholder, not a live AI answer.
5. The existing web backend currently uses the legacy xAI Chat Completions endpoint and `grok-4.5`. Before production agent execution, migrate the server-side integration to the xAI Responses API, use a current supported model configured server-side, implement strict JSON-schema tool calls, validate arguments on the server, and return execution results to the model. Keep `XAI_API_KEY` server-side only.

## Recommended architecture
- Android app (Kotlin / Compose): UI, permissions, speech, intents, accessibility bridge, notification actions
- Agent backend: model calls, tool schema, multi-step planning, policy checks, audit events
- Tool registry: `open_app`, `search_web`, `open_wifi_settings`, `create_reminder`, `read_calendar` (with connector consent), etc.
- Memory: user-controlled local profile + encrypted sync only after sign-in and explicit opt-in
- Voice: system TTS voice picker first; optional cloud real-time voice provider later

## Phased delivery
### M0 — Native shell (added)
Android project, Compose UI, speech entry, TTS, accessibility declaration, safe app launch primitives.

### M1 — Real conversation
Add a backend URL configuration, authenticated server proxy, streaming Responses API client, conversation history, cancellation and voice interruption.

### M2 — Tool execution
Implement schema-constrained tool calls and a local Android tool executor. Start with low-risk actions: launch app, web search, open settings page, timer. Require confirmation for messages, calls, purchases, deletion, account changes and sending data externally.

### M3 — Voice experience
Selectable installed TTS voices, partial speech recognition, barge-in, wake-word feasibility study, visible microphone foreground service where permitted.

### M4 — Life agent
Local reminders, calendar/email integrations through supported APIs and OAuth, encrypted memory, user controls for inspect/export/delete.

### M5 — QA and release
Test on real Android devices across API levels; battery, permission denial, offline, network errors, accessibility service disabled, app-not-installed, and Play policy review.

## Build prerequisites
Open `android/` as an Android Studio project with JDK 17 and Android SDK 35 installed. The current execution environment did not include Gradle or an Android SDK, so an APK build and device test have not been performed here.

## Progress update — 2026-11-15
### M1 — Real conversation (partially implemented)
- Added authenticated HTTPS backend endpoint at `POST /api/jarvis/chat`.
- The endpoint keeps `XAI_API_KEY` server-side, checks `JARVIS_ACCESS_TOKEN`, bounds user text/history, and proxies chat to xAI.
- Added native OkHttp client, backend URL setup, in-memory access-token entry, conversation history, error feedback, and TTS playback of replies.
- Added environment-variable template `.env.jarvis.example` and setup notes in `android/README.md`.

Still required to finish M1: deploy the backend with server secrets, configure the endpoint/token on the phone, and verify a real request on-device. No APK build or device test has been performed in this environment because Android SDK/Gradle are unavailable.
