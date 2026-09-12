# Feature Specification: Data Deletion & Privacy Controls

**Feature Branch**: `104-data-deletion`

**Created**: 2026-09-12

**Status**: Draft (DIFERIDO — refinar post-alpha; v1.0)

**Input**: User description: "Flujo visible 'borrar todos mis datos' y mini dashboard de privacidad (v1.0). Requisito de revisión de App Store/Play (account/data deletion). Borra datos locales y del servidor (ciphertext + metadatos + DEK envuelta), con confirmación y sin vuelta atrás."

> Nota: committed-scope v1.0 (constitución Art. I.7); requisito de store review. Se detallará just-in-time.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Borrar todos mis datos (Priority: P1)

La usuaria encuentra una opción visible para borrar todos sus datos (locales y del servidor), con confirmación explícita.

**Why this priority**: Requisito de App Store/Play y de confianza de la usuaria; sin esto no pasa revisión.

**Independent Test**: Ejecutar el borrado y verificar que se eliminan datos locales, ciphertext del server, metadatos y la DEK envuelta; confirmar que la cuenta queda sin datos.

**Acceptance Scenarios**:

1. **Given** Ajustes, **When** la usuaria elige "borrar todos mis datos" y confirma, **Then** se eliminan los datos locales y del servidor.
2. **Given** el borrado, **When** se verifica el servidor, **Then** no quedan ciphertext, metadatos de salud ni DEK envuelta de la cuenta.

---

### User Story 2 - Eliminar la cuenta (Priority: P1)

La usuaria puede eliminar su cuenta por completo (no solo los datos), desvinculando dispositivos.

**Why this priority**: "Account deletion" es requisito explícito de App Store cuando hay cuentas.

**Independent Test**: Eliminar la cuenta y verificar que no puede iniciar sesión ni recuperar datos.

**Acceptance Scenarios**:

1. **Given** una cuenta, **When** la usuaria la elimina y confirma, **Then** la cuenta y sus vínculos desaparecen.

---

### User Story 3 - Mini dashboard de privacidad (Priority: P2)

La usuaria ve de forma clara qué datos existen, dónde (local/servidor), cómo se protegen y cómo ejercer sus derechos.

**Why this priority**: Refuerza el onboarding de confianza de Martha y el cumplimiento GDPR (transparencia).

**Independent Test**: Abrir el dashboard y verificar que explica almacenamiento, cifrado y opciones de borrado/exportación.

**Acceptance Scenarios**:

1. **Given** el dashboard de privacidad, **When** la usuaria lo abre, **Then** ve qué datos hay, dónde y cómo borrarlos/exportarlos.

---

### Edge Cases

- Borrado con sync pendiente → garantizar que no resucita desde otro device (propagar tombstones/borrado de cuenta).
- Borrado accidental → confirmación fuerte; sin recuperación (coherente con E2EE).
- Datos ya exportados (PDF) fuera de la app → fuera del alcance del borrado (la usuaria lo controla).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer una opción visible "borrar todos mis datos" con confirmación explícita.
- **FR-002**: El borrado DEBE eliminar datos locales y del servidor (ciphertext + metadatos de salud + DEK envuelta).
- **FR-003**: El sistema DEBE permitir eliminar la cuenta por completo y desvincular dispositivos.
- **FR-004**: El borrado DEBE propagarse para que los datos no resuciten vía sync desde otro device.
- **FR-005**: El sistema DEBE proveer un mini dashboard de privacidad (qué datos, dónde, protección, derechos).
- **FR-006**: El borrado DEBE ser irreversible y comunicarse como tal antes de confirmar.

### Key Entities

- **DeletionRequest**: solicitud de borrado de datos/cuenta.
- **PrivacyDashboard**: vista de transparencia de datos y derechos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tras el borrado, 0 datos de salud (locales o del servidor) permanecen recuperables.
- **SC-002**: El flujo de borrado/eliminación de cuenta es visible y accesible en <2 toques desde Ajustes.
- **SC-003**: Cumple el requisito de account/data deletion de App Store y Google Play (verificable en revisión).

## Assumptions

- Diferido a v1.0 (el alpha local-only borra con desinstalar; igualmente conviene un "borrar datos locales" básico — ver spec 000/001 si se adelanta).
- Depende de auth (101), E2EE (102) y sync (103) para el borrado propagado.
- Los PDF ya exportados están fuera del alcance del borrado en la app.
