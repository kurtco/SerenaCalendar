# Research: Mobile Foundation

**Feature**: 000-mobile-foundation · **Date**: 2026-09-12

## R-1 · SQLite driver + ORM: `expo-sqlite` + Drizzle (chosen) vs `op-sqlite`

- **Chosen**: `expo-sqlite` + `drizzle-orm`. Expo-managed native module (no extra prebuild friction), first-class Drizzle support, `drizzle-kit` generates **versioned migrations** (Constitution II.4).
- **Rejected**: `op-sqlite` — faster, but adds native config/prebuild complexity; alpha query volumes don't need it. Revisit if calendar/history perf demands.

## R-2 · At-rest encryption: field-level (chosen for alpha) vs SQLCipher

- **Chosen**: **field-level AES-256-GCM** on sensitive columns, keys in `expo-secure-store` (Constitution I.8 alpha level). No native build friction; works with plain `expo-sqlite`.
- **Deferred**: SQLCipher (whole-DB) — stronger but native build/config overhead; candidate for v1.0 hardening.

## R-3 · Design-system consumption: workspaces + package name (chosen) vs manual alias

- **Chosen**: root `workspaces: ["mobile","packages/*"]`; package `@repo/ui-native` symlinked into `node_modules`; import by real name. **No** tsconfig/babel/metro alias → removes alias-multi-config risk.
- **Metro**: `watchFolders` includes `packages/ui-native`; symlinked source resolves to a real path **outside** `node_modules`, so Expo/Babel transpiles it (source-consumption, no build step in the design system).
- **Rejected**: manual `paths`/`module-resolver` alias (fragile across tsconfig/babel/jest/metro).

## R-4 · Prefs/ephemeral: MMKV (chosen) vs AsyncStorage

- **Chosen**: `react-native-mmkv` — fast, synchronous API, supports encryption; matches Constitution II.3 (prefs ≠ domain).

## R-5 · Distribution: EAS dev/preview builds (chosen)

- Expo Go cannot host AdMob/native crypto → **EAS Build** (dev/preview profiles). iOS: TestFlight internal / ad-hoc; Android: APK sideload. (AdMob/expo-print New-Arch compat is validated in 002/004, not here.)

## R-6 · State: Zustand (presentation-only)

- Per Constitution V.3; persistence never imported into stores; stores read via use-cases/repositories.

## Open validations (tracked as tasks)

- V-1: Expo SDK 53 + New Arch boots with `expo-sqlite`, MMKV, secure-store on iOS+Android dev builds.
- V-2: Metro transpiles the symlinked `@repo/ui-native` source and hot-reloads on submodule update.
