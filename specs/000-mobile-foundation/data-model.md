# Data Model: Mobile Foundation

**Feature**: 000-mobile-foundation · **Date**: 2026-09-12

## Domain entities (Tier-1 SQLite, Drizzle)

- **Cycle**: `id` (uuid pk), `start_date` (ISO/UTC), `length_days?`, `created_at`, `updated_at`, `deleted_at?`.
- **PeriodLog**: `id` pk, `cycle_id?` fk, `day` (ISO date), `flow?` (light/medium/heavy), `created_at`, `updated_at`, `deleted_at?`.
- **SymptomLog**: `id` pk, `day`, `symptom` (enum/key), `created_at`, `updated_at`, `deleted_at?`.
- **MoodLog**: `id` pk, `day`, `mood` (enum/key), `created_at`, `updated_at`, `deleted_at?`.

> All dates stored **UTC/ISO** (Constitution VII.2). Soft-delete via `deleted_at` to mirror future sync tombstones (Constitution III.2).

## Sensitive fields (field-level encrypted at rest)

Encrypted (AES-256-GCM, nonce per row) before write; plaintext never persisted:
`PeriodLog.flow`, `SymptomLog.symptom`, `MoodLog.mood`, and any free-text.
Non-sensitive (queryable) remain plaintext: ids, `day`, timestamps, fk.

## Key material (expo-secure-store, never in SQLite)

- `dek` (data-encryption key, random 256-bit) stored under a secure-store key.
- KDF/salt metadata if passphrase wrapping is introduced (v1.0); alpha uses device-bound DEK in secure-store.

## Prefs / ephemeral (MMKV, not SQLite)

- `onboarding_completed`, `theme`, `default_cycle_length`, `default_period_length`, `last_interstitial_ts` (002), consent flags (003).

## Migrations

- `drizzle-kit generate` → `mobile/src/data/db/migrations/####_*.sql`; runner executes pending migrations at bootstrap (Constitution II.4). Migration 0000 creates the four tables + indexes on `day` and `cycle_id`.
