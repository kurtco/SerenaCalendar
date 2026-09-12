# Implementation Plan: Mobile Foundation (Walking Skeleton)

**Branch**: `000-mobile-foundation` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/000-mobile-foundation/spec.md`

## Summary

Alpha foundation: an installable, **offline-first**, privacy-preserving Expo app shell with Clean Architecture boundaries, local persistence (SQLite/Drizzle + MMKV) with **field-level at-rest encryption**, versioned migrations, and consumption of the native design system `@repo/ui-native` via **git submodule + workspaces** (no manual aliases). No backend/auth/sync in the alpha (deferred to v1.0 per Constitution "Alcance por Fases").

## Technical Context

**Language/Version**: TypeScript 5.x (strict) · React Native via **Expo SDK 53** (RN 0.79), **New Architecture enabled**. (Python 3.12/FastAPI belongs to v1.0, not this feature.)

**Primary Dependencies**: `expo`, `react-native`, `zustand`, `drizzle-orm`, `expo-sqlite`, `react-native-mmkv`, `expo-secure-store`, `@react-navigation/native` + `native-stack`; design system `@repo/ui-native` (submodule/workspace, source-consumed).

**Storage**: `expo-sqlite` (Drizzle) for domain data · `react-native-mmkv` for prefs/ephemeral · `expo-secure-store` for encryption keys (Keychain/Keystore).

**Testing**: Jest + React Native Testing Library; pure unit tests for the date/prediction module and crypto helpers.

**Target Platform**: iOS + Android via **EAS dev/preview builds** (TestFlight internal/ad-hoc + APK sideload). Expo Go NOT supported (AdMob/native crypto).

**Project Type**: mobile-app (monorepo with workspaces).

**Performance Goals**: calendar month render <1s on mid-range device; cold start to onboarding without jank; all core flows work fully offline.

**Constraints**: offline-capable (no backend in alpha); field-level at-rest encryption (Constitution I.8); `android:allowBackup=false` + iOS backup exclusion; New Architecture; TS strict; design system imported only from `presentation/`.

**Scale/Scope**: closed alpha (~10 devices); ~5 screens (onboarding, calendar/day-detail, log, history, settings).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I (Privacidad)**: ✅ field-level at-rest encryption with keys in `expo-secure-store`; `allowBackup=false` + iOS backup exclusion. No health data leaves the device (no backend in alpha).
- **II (Offline-first / 2 capas)**: ✅ Tier-1 SQLite is source of truth; versioned migrations from day 1 (Drizzle runner in bootstrap). Tier-2 deferred to v1.0 (allowed by Alcance por Fases).
- **V (Clean Architecture)**: ✅ `presentation → domain ← data`; domain pure TS; Zustand only in presentation; persistence only in data; **lint rule blocks `data/`+`domain/` from importing `@repo/ui-native`**.
- **VI (Stack)**: ✅ Expo New Arch, TS strict, Zustand, Drizzle+expo-sqlite, MMKV, secure-store; monorepo `mobile/` + `packages/*`.
- **VII (Testing)**: ✅ unit tests for prediction/date module (incl. <2 cycles, DST) and crypto; ESLint/Prettier gate.
- **IX (Pedagogía)**: ✅ n/a for TS (applies to Python backend in v1.0).
- **X (SDD)**: ✅ this plan derived from approved spec + constitution.

**Gate result: PASS** (no violations → Complexity Tracking empty).

## Project Structure

### Documentation (this feature)

```text
specs/000-mobile-foundation/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── ui-native-consumption.md
│   └── local-persistence.md
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
package.json                     # workspaces: ["mobile", "packages/*"]
packages/
└── ui-native/                   # git submodule @repo/ui-native (pinned v0.1.0)
mobile/
├── package.json  app.json  metro.config.js  babel.config.js  tsconfig.json
├── eas.json
└── src/
    ├── domain/
    │   ├── entities/            # Cycle, PeriodLog, SymptomLog, MoodLog, Prediction
    │   └── use-cases/           # LogPeriodUseCase, CalculatePredictionUseCase (pure)
    ├── data/
    │   ├── db/                  # drizzle schema + migrations runner (expo-sqlite)
    │   ├── repositories/        # CycleRepository, PeriodLogRepository, ...
    │   ├── kv/                  # MMKV prefs store
    │   ├── crypto/              # field-level AES-GCM at-rest (keys in secure-store)
    │   └── mappers/
    └── presentation/
        ├── screens/             # Onboarding, Calendar, DayDetail, History, Settings
        ├── components/          # app-level; imports @repo/ui-native here ONLY
        ├── stores/              # zustand (presentation-only)
        └── theme/               # RN theme DERIVED from @repo/ui-native tokens
backend/                         # (v1.0, deferred) FastAPI + Postgres
```

**Structure Decision**: Monorepo with npm workspaces; Expo app under `mobile/` using Clean Architecture layers; design system consumed as the submodule package `packages/ui-native` by its real name `@repo/ui-native` (workspaces symlink; **no alias config**). Metro adds `watchFolders` for `packages/ui-native` so Expo transpiles the symlinked TS source.

## Complexity Tracking

> No constitution violations; table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
