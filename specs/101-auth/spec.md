# Feature Specification: Authentication & Identity

**Feature Branch**: `101-auth`

**Created**: 2026-09-12

**Status**: Draft (DIFERIDO — refinar post-alpha; v1.0)

**Input**: User description: "Identidad de la usuaria (v1.0): Sign in with Apple y email desde día 1, emisión de sesión/token, y vínculo cuenta↔dispositivos para recuperación. La identidad es independiente de las claves criptográficas: autenticarse NO equivale a poder descifrar (constitución Art. IV)."

> Nota: committed-scope v1.0; se detallará just-in-time. La recuperación criptográfica real vive en spec 102 (E2EE), no aquí.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in with Apple (Priority: P1)

La usuaria inicia sesión con su cuenta de Apple. Obligatorio si se ofrece cualquier login social (política de App Store).

**Why this priority**: Es el método principal y el de menor fricción en iOS, y requisito de Apple si hay login social.

**Independent Test**: Flujo completo de Sign in with Apple en un device; verificar creación/vínculo de cuenta y emisión de sesión.

**Acceptance Scenarios**:

1. **Given** una usuaria nueva, **When** completa Sign in with Apple, **Then** se crea su cuenta y recibe una sesión válida.
2. **Given** una usuaria existente, **When** vuelve a iniciar sesión, **Then** se vincula a la misma cuenta.

---

### User Story 2 - Login por email (Priority: P1)

La usuaria inicia sesión con email (magic link / OTP), habilitando recuperación cross-platform (también Android).

**Why this priority**: Cubre Android y usuarias sin Apple ID; esencial para la promesa multiplataforma.

**Independent Test**: Solicitar magic link/OTP, completar login y verificar sesión.

**Acceptance Scenarios**:

1. **Given** un email, **When** la usuaria lo verifica (link/OTP), **Then** se crea/vincula la cuenta y se emite sesión.

---

### User Story 3 - Sesión y vínculo cuenta↔dispositivos (Priority: P2)

El sistema emite una sesión/token y registra los dispositivos vinculados a la cuenta, base para la recuperación y el sync.

**Why this priority**: Permite recuperar la cuenta en un dispositivo nuevo y sincronizar.

**Independent Test**: Iniciar sesión en dos dispositivos y verificar que ambos ven la misma cuenta; cerrar sesión en uno.

**Acceptance Scenarios**:

1. **Given** una cuenta, **When** la usuaria inicia sesión en un segundo dispositivo, **Then** ambos quedan vinculados a la misma identidad.
2. **Given** una sesión, **When** la usuaria cierra sesión, **Then** el token deja de ser válido.

---

### Edge Cases

- Token expirado / refresh.
- Misma usuaria con Apple y email → vinculación/desduplicación de cuentas.
- Login social obligatorio implica ofrecer Sign in with Apple.
- Eliminación de cuenta (cross-ref spec 104, requisito App Store).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE soportar Sign in with Apple.
- **FR-002**: El sistema DEBE soportar login por email (magic link/OTP).
- **FR-003**: El sistema DEBE emitir sesión/token de duración controlada con mecanismo de refresh.
- **FR-004**: El sistema DEBE vincular dispositivos a la cuenta para recuperación y sync.
- **FR-005**: La identidad DEBE ser independiente de las claves E2EE; el servidor NUNCA custodia claves de descifrado de salud (ver spec 102).
- **FR-006**: El sistema DEBE soportar cierre de sesión y eliminación de cuenta (cross-ref 104).
- **FR-007**: El sistema DEBE manejar vinculación/desduplicación cuando una usuaria usa Apple y email.

### Key Entities

- **User**: identidad de la cuenta.
- **AuthProvider**: apple / email.
- **Device**: dispositivo vinculado a la cuenta.
- **Session/Token**: credencial de sesión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una usuaria puede iniciar sesión en 2 dispositivos y ver la misma cuenta en <1 minuto.
- **SC-002**: 0 exposiciones de claves de descifrado a través del flujo de auth.
- **SC-003**: El 100% de los logins sociales incluyen Sign in with Apple (requisito Apple).
- **SC-004**: Tokens expirados se refrescan o reautentican sin pérdida de sesión inesperada.

## Assumptions

- La recuperación criptográfica (passphrase + recovery key + escrow) se implementa en spec 102, no aquí.
- Diferido a v1.0 (el alpha es local-only, sin cuentas).
- Auth sobre la fundación del spec 100.
