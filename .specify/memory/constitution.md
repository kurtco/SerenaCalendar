# Serena Constitution

> Tracker de Ciclo Menstrual · Proyecto de aprendizaje (Lead Developer viene de Nest/JS).
> Esta constitución define los principios NO negociables que gobiernan toda
> especificación, plan, tarea e implementación. Cualquier artefacto SDD que la
> contradiga es inválido hasta enmendar este documento.

## Core Principles

### I. Privacidad y Seguridad por Diseño (NON-NEGOTIABLE)

Los datos de ciclo menstrual son categoría especial (GDPR art. 9).

1. **Alcance:** los datos de salud siempre están protegidos. Cuando **SALEN** del
   device (server/sync) aplica E2EE (I.2–I.5); cuando **PERMANECEN** en el device
   (builds locales) aplica cifrado en reposo (I.8). El servidor jamás ve claves ni
   datos de salud en claro.
2. **E2EE (envelope):** cada registro se cifra en el device con AES-256-GCM (nonce
   único por fila) bajo una **DEK** aleatoria. La DEK se envuelve con una **KEK**
   derivada de una passphrase (Argon2id); un **recovery key** de alta entropía es
   la vía alternativa de recuperación.
3. El servidor solo custodia: metadatos de sync en claro + `ciphertext` + la DEK
   envuelta (blob opaco + salt + params KDF). Nunca la passphrase ni la DEK.
4. En el device, las claves viven en `expo-secure-store` (Keychain/Keystore).
   Prohibido loguearlas, transmitirlas o persistirlas fuera del secure storage.
5. **(MVP · Fase 1)** La recuperación cross-device DEBE ser posible
   criptográficamente SIN confiar en el servidor, mediante secreto poseído por la
   usuaria: **passphrase + recovery key** (último recurso); la DEK envuelta se
   custodia en el server (zero-knowledge).
   - *Diferido a v2.0 (fuera del MVP a propósito):* iCloud Keychain como enhancer
     cero-fricción solo-iOS, y SVR/enclave o rate-limiting server-side como
     hardening contra brute-force offline. Diferido para priorizar la validación
     de mercado (retención de la UI de Martha + ingresos AdMob).
6. Cero PII en logs, analítica y crash reporting (Sentry con scrubbing).
7. Flujo visible "borrar todos mis datos" (requisito App Store/Play) — v1.0.
8. **Protección en reposo (on-device):** los datos de salud almacenados localmente
   se cifran at-rest con claves en `expo-secure-store`. Nivel **Alpha: field-level**.
   Obligatorio `android:allowBackup=false` y excluir backup en iOS (`NSFileProtection`)
   para evitar que el OS copie la BD a la nube sin control.

### II. Offline-first y Persistencia en Dos Capas

1. **Tier 1 (on-device):** `expo-sqlite` + Drizzle es la fuente de verdad para la
   UI. La app es 100% funcional sin red.
2. **Tier 2 (servidor):** PostgreSQL es la copia canónica y durable. Sobrevive a
   borrar la app y a cambiar de dispositivo.
3. Preferencias/estado efímero en MMKV; datos de dominio en SQLite. Frontera
   inquebrantable.
4. Migraciones de schema locales versionadas desde el día 1 (runner en el
   bootstrap). Prohibido corromper/borrar datos al actualizar.

### III. Sincronización y Consistencia

1. Sync **bidireccional manual**, resolución **last-write-wins** por
   `(version, updated_at)` sobre el envelope en claro.
2. Soft-delete con tombstones (`deleted_at`); nunca borrado físico en sync.
3. El servidor ordena y mezcla SIN descifrar. Idempotencia garantizada por `id`.
4. Merge, idempotencia y tombstones cubiertos por tests.

### IV. Autenticación e Identidad

1. Sign in with Apple / email desde día 1 (Apple obligatorio si hay login social).
2. La identidad es independiente de las claves criptográficas: autenticarse NO
   equivale a poder descifrar (ver I.5).

### V. Clean Architecture y Boundaries

1. Regla de dependencia: `presentation → domain ← data`.
2. `domain` = TS puro (entidades + casos de uso), sin dependencias de RN ni DB.
3. Zustand SOLO en presentation; persistencia SOLO en data. Un store que importe
   SQLite rompe la arquitectura (build fail).
4. Patrón Repository; casos de uso testeables de forma aislada.

### VI. Stack Tecnológico (Ratificado)

1. **Mobile:** React Native + Expo (New Architecture), TypeScript strict, Zustand,
   Drizzle sobre `expo-sqlite`, MMKV, `expo-secure-store`.
2. **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL 17
   (dev local → prod Neon).
3. **Tooling:** `uv` (deps/venv), `ruff` (lint+format), `pytest`. Monorepo
   `mobile/` + `backend/`.

### VII. Testing y Calidad

1. Lógica de dominio pura (predicción/ciclos) con unit tests, incluidos edge cases:
   <2 ciclos = sin predicción, DST, cambios de zona horaria.
2. Fechas almacenadas en UTC/ISO; cálculo en módulo puro y determinista.
3. Backend: `pytest` para sync (merge/idempotencia/tombstones) y auth.
4. `ruff` + ESLint/Prettier en verde antes de merge.

### VIII. Ética de Producto y Monetización (NON-NEGOTIABLE)

1. NINGUNA feature crítica de salud se bloquea por falta de fill publicitario.
   Los anuncios son **fail-open** (nunca fail-closed).
2. El **PDF médico es gratis y on-device** (coherente con E2EE); jamás gateado
   tras rewarded.
3. Rewarded reservado a lo cosmético (temas/iconos) y nice-to-have (tendencias).
4. Frequency capping de intersticial (48h) por timestamp local en MMKV; nunca en
   momentos íntimos/vulnerables.
5. Analítica anónima, agregada, sin datos de salud y tras consentimiento (UMP/GDPR).

### IX. Convención de Código Pedagógica

1. El código Python se comenta en **español**: comentarios cortos que enfatizan la
   comparación con su equivalente JS/Nest/TS (el Lead Developer viene de Nest).
2. Claridad sobre astucia; el objetivo incluye aprendizaje.

### X. Desarrollo Guiado por Especificaciones (SDD)

1. Toda feature atraviesa: constitution → specify → (clarify) → plan → tasks →
   (analyze) → implement → converge.
2. No se escribe código de una feature sin spec + plan aprobados.
3. Esta constitución gobierna todos los artefactos; cualquier conflicto exige
   enmienda con Sync Impact Report y bump de versión.
4. **Actualización de estado obligatoria:** cada vez que un paso o entregable de
   una spec se implementa y se verifica exitosamente, se debe actualizar el
   `Status` de `specs/<feature>/spec.md` describendo qué se probó y en qué
   entorno (simulador, dispositivo, test, etc.). Una feature no se considera
   cerrada mientras su spec no refleje el estado real.

## Alcance por Fases

Qué principios aplican cuándo, sin violarlos:

- **Alpha cerrada (MVP · 10 devices, local-only, fuera de tiendas):** logging
  offline + predicción, UI de Martha, cifrado at-rest field-level (I.8), AdMob
  fail-open, analítica anónima con consentimiento. **SIN** backend/auth/E2EE/sync.
  Distribución: EAS dev build (no Expo Go), TestFlight interno/ad-hoc + APK/adb.
- **v1.0 pública (tiendas):** + FastAPI/Postgres, auth Apple/email, E2EE
  (passphrase + recovery key + escrow), sync LWW, flujo "borrar mis datos".
- **v2.0:** iCloud Keychain (enhancer iOS), SVR/hardening.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica o preferencia.
- Enmiendas requieren decisión explícita del Product Owner, bump de versión y un
  Sync Impact Report documentando el cambio.
- Todas las specs/plans/tasks deben verificar cumplimiento constitucional como
  gate antes de `/speckit.implement`.
- Guía de desarrollo en runtime: `AGENTS.md` (preferencias del Lead) + `contexto.md`.
- La complejidad debe justificarse; YAGNI por defecto (validar mercado antes que
  sobre-ingeniería).

**Version**: 1.0.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-12
