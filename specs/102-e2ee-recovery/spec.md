# Feature Specification: E2EE & Key Recovery (Passphrase + Recovery Key)

**Feature Branch**: `102-e2ee-recovery`

**Created**: 2026-09-12

**Status**: Draft (DIFERIDO — refinar post-alpha; v1.0)

**Input**: User description: "Cifrado end-to-end y recuperación de clave (v1.0, Fase 1): envelope encryption con DEK por usuaria, KEK derivada de passphrase (Argon2id) y recovery key de alta entropía como último recurso. El servidor custodia la DEK envuelta (zero-knowledge). Recuperación cross-device SIN confiar en el servidor. iCloud Keychain/SVR quedan diferidos a v2.0."

> Nota: committed-scope v1.0 (Art. I de la constitución); se detallará just-in-time. Esta es la base criptográfica que habilita sync (103) y el lanzamiento público.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cifrar en el dispositivo (Priority: P1)

Cada registro de salud se cifra en el dispositivo con AES-256-GCM (nonce único por fila) bajo una DEK aleatoria antes de salir del device.

**Why this priority**: Es la garantía central de privacidad (zero-knowledge) y requisito para subir datos de salud a un servidor.

**Independent Test**: Registrar un dato, verificar que lo que se envía/almacena en el server es ciphertext; descifrar localmente con la DEK.

**Acceptance Scenarios**:

1. **Given** un registro nuevo, **When** se prepara para sync, **Then** se cifra con la DEK (AES-256-GCM, nonce único).
2. **Given** el ciphertext en el server, **When** se inspecciona, **Then** no revela datos de salud.

---

### User Story 2 - Proteger la DEK con passphrase + recovery key (Priority: P1)

La DEK se envuelve con una KEK derivada de la passphrase de la usuaria (Argon2id). Se genera además un recovery key de alta entropía como último recurso. La DEK envuelta se custodia en el servidor (blob opaco + salt + params).

**Why this priority**: Sin envoltura y escrow zero-knowledge no hay recuperación posible tras borrar la app.

**Independent Test**: Configurar passphrase, generar recovery key, verificar que el server solo guarda la DEK envuelta; desenvolver con passphrase y con recovery key.

**Acceptance Scenarios**:

1. **Given** el setup inicial, **When** la usuaria crea su passphrase, **Then** se deriva la KEK (Argon2id) y se envuelve la DEK.
2. **Given** el setup, **When** se genera el recovery key, **Then** se muestra una sola vez para que la usuaria lo guarde.
3. **Given** el server, **When** se consulta, **Then** solo contiene la DEK envuelta + salt + params (nunca passphrase ni DEK en claro).

---

### User Story 3 - Recuperar en un dispositivo nuevo (Priority: P1)

Tras reinstalar o cambiar de dispositivo, la usuaria inicia sesión (spec 101), introduce su passphrase (o recovery key), desenvuelve la DEK y descifra sus datos sincronizados.

**Why this priority**: Es el caso que motiva todo el backend: sobrevivir a borrar la app / cambiar de móvil.

**Independent Test**: En un segundo device, login + passphrase → desenvolver DEK → descargar ciphertext → descifrar y verificar datos.

**Acceptance Scenarios**:

1. **Given** un device nuevo con la cuenta, **When** la usuaria introduce su passphrase correcta, **Then** desenvuelve la DEK y descifra su histórico.
2. **Given** passphrase olvidada, **When** la usuaria usa el recovery key, **Then** recupera el acceso a sus datos.
3. **Given** credencial incorrecta, **When** intenta desenvolver, **Then** falla de forma segura sin revelar información.

---

### Edge Cases

- Passphrase olvidada SIN recovery key guardado → pérdida (trade-off inherente a E2EE); la UI debe advertirlo en el setup.
- Passphrase de baja entropía → vulnerable a brute-force offline del blob envuelto; exigir entropía mínima + Argon2id de alto coste.
- Cambio de passphrase → re-envolver la DEK.
- Claves en device: almacenadas en `expo-secure-store`; nunca logueadas ni transmitidas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE cifrar cada registro de salud en el device con AES-256-GCM (nonce único por fila) bajo una DEK aleatoria.
- **FR-002**: El sistema DEBE derivar la KEK de la passphrase con Argon2id (coste alto) y envolver la DEK.
- **FR-003**: El sistema DEBE generar un recovery key de alta entropía como vía alternativa de recuperación, mostrado una sola vez.
- **FR-004**: El servidor DEBE custodiar solo la DEK envuelta (blob opaco + salt + params KDF), zero-knowledge.
- **FR-005**: La recuperación cross-device DEBE ser posible SIN confiar en el servidor (passphrase o recovery key).
- **FR-006**: Las claves DEBEN vivir en `expo-secure-store` (Keychain/Keystore); prohibido loguearlas/transmitirlas.
- **FR-007**: El sistema DEBE permitir cambiar la passphrase (re-envolver la DEK).
- **FR-008**: El sistema DEBE exigir una entropía mínima de passphrase y comunicar el riesgo de olvido.

### Key Entities

- **DEK**: Data Encryption Key (cifra registros).
- **KEK**: Key Encryption Key (derivada de passphrase, envuelve la DEK).
- **RecoveryKey**: secreto de alta entropía de último recurso.
- **WrappedDEK**: blob opaco + salt + params KDF custodiado en el server.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 datos de salud en claro llegan al servidor (todo ciphertext).
- **SC-002**: Una usuaria puede recuperar su histórico en un device nuevo con passphrase o recovery key en <2 minutos.
- **SC-003**: El servidor no puede descifrar ningún registro (zero-knowledge verificable).
- **SC-004**: Passphrase de baja entropía es rechazada en el setup (0 passphrases débiles aceptadas).

## Assumptions

- Diferido a v1.0 (el alpha usa cifrado at-rest field-level local, spec 000, sin servidor).
- Fase 1 = passphrase + recovery key + escrow; iCloud Keychain (200) y SVR/hardening (201) son v2.0.
- Auth (101) provee la identidad; esta spec provee la recuperación criptográfica.
- Convención pedagógica de comentarios Python (Art. IX).
