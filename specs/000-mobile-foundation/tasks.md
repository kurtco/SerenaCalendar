# Implementation Tasks: Mobile Foundation (000)

**Feature**: `000-mobile-foundation` · **Branch**: `000-mobile-foundation` · **Generated**: 2026-09-13 · **Last updated**: 2026-09-13

Derived from `spec.md`, `plan.md`, `data-model.md`, `contracts/` and `research.md`.

## Goal

Build the installable, offline-first, privacy-preserving Expo app shell with Clean Architecture boundaries, local persistence (SQLite/Drizzle + MMKV), field-level at-rest encryption, versioned migrations, and consumption of `@repo/ui-native` via git submodule + workspaces.

## Implementation Strategy

- MVP first: get the design system connected and the app booting, then add persistence/crypto, then enforce architecture boundaries.
- Follow Clean Architecture from the start: `presentation → domain ← data`.
- Validate each user story independently before moving to the next.
- Update `specs/000-mobile-foundation/spec.md` `Status` after every verified increment.

## Dependency Graph

```
T001 (constitution) → T002-T005 (tooling) → T006-T009 (deps) → T010-T012 (structure/EAS)
   │
   ├──> Phase 3 [US1] boot + onboarding
   │        └──> Phase 4 [US2] persistence + crypto
   │                 └──> Phase 5 [US3] Clean Architecture boundaries
   │                          └──> Phase 6 polish + verification
```

User stories are sequential dependencies: US2 needs the app shell from US1; US3 needs the persistence layer from US2 to demonstrate boundaries end-to-end.

## Phase 1 — Setup & Tooling

- [x] T001 Add spec-status update rule to `.specify/memory/constitution.md`.
- [x] T002 Add `test`, `lint`, `typecheck`, `format` scripts to `mobile/package.json`.
- [x] T003 Configure ESLint + Prettier in `mobile/` with Clean Architecture boundary rules.
- [x] T004 Configure Jest + React Native Testing Library in `mobile/jest.config.js`.
- [x] T005 Verify `mobile/metro.config.js` watches `packages/ui-native` for design-system hot-reload.

## Phase 2 — Foundational Dependencies & Project Structure

- [x] T006 [P] Install Expo SDK modules: `expo-sqlite`, `expo-secure-store`, `expo-dev-client` via `npx expo install` in `mobile/`.
- [x] T007 [P] Install JS/state libraries: `zustand`, `drizzle-orm` in `mobile/`.
- [x] T008 [P] Install native KV library `react-native-mmkv` with version compatible with RN 0.86 / Expo SDK 57.
- [x] T009 [P] Install dev tools: `drizzle-kit`, `@types/uuid` in `mobile/`.
- [x] T010 Create Clean Architecture folder structure under `mobile/src/` (`domain/`, `data/`, `presentation/`).
- [x] T011 Configure `mobile/eas.json` with `development` and `preview` profiles.
- [x] T012 Update `mobile/app.json`:
  - `ios.bundleIdentifier` / `android.package`.
  - `newArchEnabled: true`.
  - `android.allowBackup: false` and iOS backup exclusion for health DB.
  - EAS project ID placeholder.

## Phase 3 — User Story 1: Instalar y arrancar offline (P1)

**Goal**: App boots to onboarding without crashing and works fully offline.
**Independent test**: Cold-start on iOS simulator with airplane mode reaches onboarding.

- [x] T013 [US1] Create `mobile/src/presentation/screens/SplashScreen.tsx` using `@repo/ui-native` tokens.
- [x] T014 [US1] Create `mobile/src/presentation/screens/OnboardingScreen.tsx` with `SerenaButton`.
- [x] T015 [US1] Wire `mobile/App.tsx` / `mobile/index.ts` to show Splash → Onboarding flow.
- [x] T016 [US1] Add RNTL smoke test verifying onboarding renders without network.
- [x] T017 [US1] Run on iOS simulator with airplane mode and update `spec.md` `Status`.

## Phase 4 — User Story 2: Persistencia local privada (P1)

**Goal**: Health data is stored encrypted at rest, survives app restart, and is excluded from OS cloud backup.
**Independent test**: Save a sample log, kill app, reopen, data persists; inspect storage to confirm ciphertext.

- [x] T018 [US2] Define Drizzle schema in `mobile/src/data/db/schema.ts` for `cycles`, `period_logs`, `symptom_logs`, `mood_logs` with `deleted_at` soft-delete and indexes on `day` / `cycle_id`.
- [x] T019 [US2] Generate initial migration `mobile/src/data/db/migrations/0000_init.sql` via `drizzle-kit generate`.
- [x] T020 [US2] Implement migration runner `mobile/src/data/db/migrate.ts` and invoke it at bootstrap.
- [x] T021 [US2] Implement `mobile/src/data/crypto/keyStore.ts`: generate/retrieve 256-bit DEK from `expo-secure-store`.
- [x] T022 [US2] Implement `mobile/src/data/crypto/fieldCipher.ts`: AES-256-GCM encrypt/decrypt with per-row nonce, base64 payload.
- [x] T023 [US2] Implement repository ports in `mobile/src/domain/repositories/` and SQLite adapters in `mobile/src/data/repositories/` for `CycleRepository` and `PeriodLogRepository`.
- [x] T024 [US2] Encrypt sensitive fields (`PeriodLog.flow`, `SymptomLog.symptom`, `MoodLog.mood`) on write and decrypt on read.
- [x] T025 [US2] Verify `android:allowBackup=false` and iOS backup exclusion in `app.json`.
- [x] T026 [US2] Add repository + crypto unit tests and update `spec.md` `Status`.
  - Crypto unit test passes. Full repository integration test requires a dev build / simulator run (deferred to T036 verification).

## Phase 5 — User Story 3: Boundaries de arquitectura limpia (P2)

**Goal**: Dependency rules are enforceable; domain is pure and stores do not import persistence.
**Independent test**: A trivial use-case crosses presentation → domain ← data; lint fails on boundary violations.

- [x] T027 [US3] Create pure domain entities in `mobile/src/domain/entities/`.
- [x] T028 [US3] Implement sample use case `mobile/src/domain/use-cases/CompleteOnboardingUseCase.ts` crossing all layers.
- [x] T029 [US3] Create Zustand store in `mobile/src/presentation/stores/` that calls the use case; no direct import of persistence.
- [x] T030 [US3] Add ESLint `no-restricted-imports` rule: `mobile/src/data/**` and `mobile/src/domain/**` cannot import `@repo/ui-native`.
- [x] T031 [US3] Add ESLint rule: `mobile/src/presentation/**` cannot import `mobile/src/data/**` directly (must go through domain use cases).
- [ ] T032 [US3] Add architecture boundary tests and update `spec.md` `Status`.

## Phase 6 — Polish & Cross-Cutting Verification

- [x] T033 Configure `app.json` plugins for `expo-secure-store` and `expo-sqlite` if required by SDK 57.
- [ ] T034 Add `.env.example` (no secrets) for EAS/project IDs.
- [x] T035 [P] Run full verification: `npm run lint && npm run typecheck && npm run test`.
- [x] T036 Update `specs/000-mobile-foundation/spec.md` `Status` to reflect all verified acceptance scenarios.

## Parallel Opportunities

- T006–T009 (dependency installation) can run together once tooling is configured.
- T013–T016 (US1 UI + test) can be developed in parallel after structure exists.
- T018–T026 (US2 persistence) can be developed in parallel with US1 UI, but integration depends on US1.
- T030–T031 (lint rules) can be added alongside US3 implementation.

## MVP Scope

The minimum viable increment is **US1 + the design-system connection**: a bootable app that renders onboarding offline. Everything else builds on top of that.
