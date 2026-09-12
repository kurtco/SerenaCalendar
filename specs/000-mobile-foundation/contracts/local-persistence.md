# Contract: Local persistence (Tier-1)

**Feature**: 000-mobile-foundation · **Date**: 2026-09-12

## Repository interfaces (domain ports, data adapters)

```ts
interface CycleRepository {
  save(c: Cycle): Promise<void>;
  update(c: Cycle): Promise<void>;
  remove(id: string): Promise<void>;        // soft-delete (deleted_at)
  findById(id: string): Promise<Cycle | null>;
  listAll(): Promise<Cycle[]>;              // ordered by start_date
}
interface PeriodLogRepository { /* same shape, keyed by day + cycle_id */ }
interface SymptomLogRepository { /* same shape, keyed by day */ }
interface MoodLogRepository { /* same shape, keyed by day */ }
```

- Implemented in `data/repositories/*` over Drizzle + `expo-sqlite`.
- Domain use-cases depend only on these ports (Constitution V).

## Crypto contract (field-level at-rest)

```ts
interface FieldCipher {
  encrypt(plaintext: string): Promise<string>;   // AES-256-GCM, nonce per row, base64 payload
  decrypt(ciphertext: string): Promise<string>;
}
```

- Key (`dek`) lives in `expo-secure-store`; never in SQLite/logs.
- Repositories encrypt sensitive fields on write, decrypt on read.

## Migrations

- Runner executes pending Drizzle migrations at bootstrap before first repository access.
