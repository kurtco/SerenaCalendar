# Feature Specification: SVR / Anti-Brute-Force Hardening

**Feature Branch**: `201-svr-hardening`

**Created**: 2026-09-12

**Status**: Deferred (v2.0 — FUERA de alcance hasta después de v1.0; stub intencional)

**Input**: User description: "Hardening contra brute-force offline de la DEK envuelta: Secure Value Recovery (enclave, estilo Signal) y/o rate-limiting server-side de intentos de desenvoltura. Endurece la base E2EE de v1.0 (spec 102) ante passphrase de baja entropía si el blob envuelto se filtra."

> STUB DIFERIDO. Por YAGNI, esta spec NO se detalla ahora. Se escribirá completa en v2.0 solo si el modelo de amenazas lo justifica tras v1.0.

## Propósito (resumen)

- Mitigar el riesgo de que un atacante con la DEK envuelta intente brute-force offline de la passphrase.
- Opciones a evaluar: enclave/SVR con intentos limitados, rate-limiting server-side de desenvoltura, endurecer Argon2id, exigir entropía mínima más alta.

## Fuera de alcance hasta v2.0

- User stories, requisitos funcionales y criterios de éxito detallados.
- Elección concreta de mecanismo (SVR vs rate-limiting vs ambos).
- Trade-offs de coste/latencia/complejidad.

## Assumptions

- v1.0 (102) ya impone Argon2id de alto coste y entropía mínima de passphrase como primera línea de defensa.
- Se aborda solo si el análisis de amenazas post-v1.0 lo recomienda.
