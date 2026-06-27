# Tenant Passport

Tenant Passport is a dark-mode-first Expo React Native app for renter onboarding and estate agent review workflows. It uses Expo Router, TypeScript, and a premium mobile-first interface for both applicant and agent journeys.

## Stack

- Expo SDK 56
- Expo Router
- React Native + TypeScript
- iOS and Android ready via `expo prebuild`

## App modes

### Applicant mode
- Welcome, login, and signup flow
- Dashboard with overview cards and quick actions
- Full tenant passport view
- Application tracker with detail screens
- Four-step onboarding flow

### Estate agent mode
- Dashboard with pipeline stats
- Applicant list and detailed review view
- Property list and property detail shortlist view

## Project structure

- `app/` – Expo Router screens and layouts
- `components/ui/` – shared UI primitives
- `constants/theme.ts` – color, spacing, typography, and radius tokens
- `data/mockData.ts` – comprehensive mock applicant, application, and property data
- `types/` – shared TypeScript types
- `assets/images/` – placeholder app icons and splash assets
- `codemagic.yaml` – iOS release pipeline configuration

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npm run start
   ```
3. Run on web if needed:
   ```bash
   npm run web
   ```

## Supabase runtime config

Set these in your shell or `.env` for Expo before launching:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Native folders

The `ios/` and `android/` directories are committed to the repository so Codemagic and local builds work without an extra step. They were generated via:

```bash
npx expo prebuild --platform ios --clean --no-install
npx expo prebuild --platform android --clean --no-install
```

To regenerate them locally (e.g. after updating `app.json` or native dependencies):

```bash
npm run prebuild:ios      # iOS only
npm run prebuild:android  # Android only
npm run prebuild          # Both platforms
```

## Running on device / simulator

After `npm install`, run directly on a connected simulator or device:

```bash
npm run ios      # Xcode simulator (macOS required)
npm run android  # Android emulator or device
```

## Linting

```bash
npm run lint
```

## Codemagic

The repository includes `codemagic.yaml` for iOS release builds. Required Codemagic secrets include:

- `APP_STORE_CONNECT_KEY_IDENTIFIER` (or `APP_STORE_CONNECT_KEY_ID`)
- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_PRIVATE_KEY`
- `IOS_BUNDLE_IDENTIFIER`

The workflow installs dependencies, runs Expo iOS prebuild, configures App Store signing, installs pods, patches deployment settings, and builds an IPA.

## Assets

`assets/images/` contains placeholder PNG files for:

- `icon.png`
- `adaptive-icon.png`
- `splash-icon.png`
- `favicon.png`

Replace these with production artwork before release.

## Known limitations

- Agent and marketing surfaces still use mock data; applicant passport and auth now read/write via Supabase when configured.
- Supabase table shape must match `lib/db.ts` payload keys for persistence.
- Right to Rent checks are recorded as self-declared fields.
- Payments and identity verification are not included.
- Web layout is supported via Expo Router / Metro but is not optimised for wide viewports.

## Next steps

1. **Auth** — Supabase Auth (email/password + magic link). Wrap the app in a session provider; redirect `(auth)` routes on sign-in.
2. **Backend / database** — Supabase Postgres: `profiles`, `passports`, `applications`, `properties` tables mirroring `types/index.ts`.
3. **Document upload** — `expo-image-picker` + Supabase Storage bucket; store signed URLs in the `passports` table.
4. **Push notifications** — alert applicants when their application status changes.
5. **Agent invite flow** — let agents invite applicants by email or shareable deep-link.
6. **Production assets** — replace placeholder icons with branded artwork.
7. **App Store / Play Store submission** — update `app.json` with real bundle IDs, configure signing in Codemagic.
