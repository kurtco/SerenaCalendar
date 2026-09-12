# Feature Specification: iCloud Keychain Enhancer (iOS zero-friction recovery)

**Feature Branch**: `200-icloud-keychain-enhancer`

**Created**: 2026-09-12

**Status**: Deferred (v2.0 — FUERA de alcance hasta después de v1.0; stub intencional)

**Input**: User description: "Enhancer opcional de recuperación cero-fricción solo-iOS: guardar la DEK en iCloud Keychain (E2EE de Apple, Secure Enclave) para que las usuarias de Apple recuperen sin introducir passphrase. No reemplaza la base cross-platform de passphrase + recovery key (spec 102)."

> STUB DIFERIDO. Por YAGNI y por el objetivo de validar mercado primero, esta spec NO se detalla ahora. Se escribirá completa en v2.0, sobre la base E2EE de v1.0 (spec 102), y solo si el alpha/v1.0 validan el producto.

## Propósito (resumen)

- Recuperación sin fricción en el ecosistema Apple (DEK en iCloud Keychain, protegida por Apple ID + passcode + Secure Enclave).
- Capa adicional, NO sustituta: Android y la recuperación universal siguen cubiertos por passphrase + recovery key (102).

## Fuera de alcance hasta v2.0

- User stories, requisitos funcionales y criterios de éxito detallados.
- Decisiones de clave exportable vs Secure Enclave (no exportable).
- Interacción con el escrow de DEK envuelta del servidor.

## Assumptions

- v1.0 (100–104) está en producción y validado antes de abordar esto.
- Solo aplica a iOS/macOS; no resuelve Android ni migración iOS→Android.
