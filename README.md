# YACC

Yet Another Calorie Counter. An Expo SDK 57 / React Native / TypeScript app targeting web, iOS, and Android. The first working slice is a local meal diary and installable PWA.

## Run locally

Use Node 22.13 or newer and npm. On Windows PowerShell, use `npm.cmd` / `npx.cmd` if execution policy blocks the PowerShell shims.

```sh
npm ci
npm run web
```

For the production PWA, including offline support:

```sh
npm run build:web
npm run preview
```

The preview is at `http://127.0.0.1:4173` and intentionally binds only to this computer. For iPhone installation, host `dist/` over HTTPS, preserving the exported HTML routes, then use Safari's Add to Home Screen action. Local development via `expo start --web` does not install a service worker. Offline use becomes available after the production app's first successful load and cache installation.

## What works

- Add, edit, and delete meals; daily calorie and macro totals; history grouped by local calendar date.
- Editable calorie target and portion scaling. The initial 2,000 kcal target is an example, not a recommendation.
- Camera/photo-library selection and preview through Expo ImagePicker.
- Explicit demo estimates: every photo returns the same sample values. **No real image analysis is connected.** Demo entries remain labeled in the diary.
- Local persistence through Zustand and AsyncStorage. Save failures retain the editor; corrupt stored data is not overwritten.
- PWA manifest, icons, and build-generated offline cache. Manual logging works offline after initial installation.

Photos are neither uploaded nor persisted. Meal records stay in this browser/app installation: no accounts, cloud backup, or cross-device sync yet. Clearing browser/app data removes records. Unsaved editor drafts are in memory only.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npx playwright install chromium webkit
npm run build:web
npm run test:e2e
npm run check:native
```

Playwright starts its own local production preview. It exercises phone-sized Chromium and WebKit: create/edit/delete, portion scaling, persistence, historical dates, target changes, photo picking, explicit demo labeling, storage errors, offline reloads, and layout overflow. Failure traces are in `test-results/`; screenshots are in `artifacts/`; the HTML report is in `playwright-report/`.

WebKit device emulation is not an iPhone. Native camera permissions, keyboard behavior, and Home Screen installation still require native/device coverage. No EAS account, signing identity, or device-testing service has been configured, and no native binary has been built or distributed.

`check:native` exports JavaScript bundles for all platforms as a compilation smoke check; it does not build or run a native binary. Generated files go to the ignored `native-check/` directory.

## Layout and next integration

- `src/app/`: Expo Router screens and navigation.
- `src/components/`: shared React Native UI and meal editor.
- `src/domain/`: nutrition calculations and saved-data validation.
- `src/state/`: Zustand store and local persistence.
- `src/services/estimator.ts`: explicit deterministic demo adapter; replacement point for a backend-backed estimator.
- `scripts/`: reproducible icons, PWA cache generation, local static preview.
- `tests/`: domain tests and browser end-to-end tests.

Application code lives under `src/`. The `@/*` import alias resolves to `src/*`; for example, `@/components/ui` refers to `src/components/ui.tsx`. The unused template routes, root helpers, and sample assets have been removed.

Real photo estimation needs a server-side endpoint and a chosen AI provider. Provider API keys must stay on the server. Supabase accounts/storage and TanStack Query should be introduced with that backend integration rather than presenting a fake synced account. Native development uses EAS development builds for the installed native modules; native project directories are generated, not maintained by hand.

## Dependency notes

The lockfile includes compatible security updates. Expo's SDK 57 dependency tree still has npm audit findings (including `braces`, `node-forge`, `decode-uri-component`, and `uuid`). No forced SDK downgrade/upgrade was applied; these need review before production release. The Router override keeps Expo CLI's optional peer dependency on the same SDK 57 Router as the app rather than pulling in SDK 58. Use `npm ci` to reproduce the checked dependency tree.
