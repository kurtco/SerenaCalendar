# Feature Specification: Cross-Device Sync (Manual LWW)

**Feature Branch**: `103-cross-device-sync`

**Created**: 2026-09-12

**Status**: Draft (DIFERIDO — refinar post-alpha; v1.0)

**Input**: User description: "Sincronización bidireccional manual entre el SQLite local y el PostgreSQL del servidor (v1.0): last-write-wins por (version, updated_at) sobre el envelope en claro, soft-delete con tombstones, idempotencia por id. El servidor ordena y mezcla SIN descifrar. Depende de E2EE (102) y auth (101)."

> Nota: committed-scope v1.0; se detallará just-in-time sobre la fundación (100), auth (101) y E2EE (102).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subir cambios locales (push) (Priority: P1)

Los registros creados/editados/borrados en el device se suben al servidor como envelopes cifrados con sus metadatos de sync en claro.

**Why this priority**: Sin push no hay copia durable ni base para otros dispositivos.

**Independent Test**: Crear/editar/borrar registros offline, luego hacer push y verificar que el server guarda los envelopes con metadatos correctos (version, updated_at, deleted_at).

**Acceptance Scenarios**:

1. **Given** cambios locales sin sincronizar, **When** hay conexión y se hace push, **Then** los envelopes llegan al server con sus metadatos.
2. **Given** un borrado local, **When** se hace push, **Then** se propaga como tombstone (deleted_at), no como borrado físico.

---

### User Story 2 - Bajar cambios del servidor (pull) (Priority: P1)

En un device (nuevo o existente), la usuaria baja los envelopes, los descifra con su DEK (spec 102) y rehidrata el SQLite local.

**Why this priority**: Es lo que materializa la recuperación cross-device y el cambio de móvil.

**Independent Test**: En un segundo device autenticado, hacer pull, descifrar y verificar que el histórico coincide.

**Acceptance Scenarios**:

1. **Given** una cuenta con datos, **When** un device autenticado hace pull, **Then** descarga los envelopes y los descifra localmente.
2. **Given** un device nuevo, **When** completa pull, **Then** su SQLite local queda rehidratado con el histórico.

---

### User Story 3 - Resolución de conflictos LWW (Priority: P1)

Cuando el mismo registro cambia en dos sitios, gana el último por (version, updated_at); el merge es determinista y el servidor lo resuelve sin descifrar.

**Why this priority**: Garantiza consistencia eventual predecible sin exponer datos al servidor.

**Independent Test**: Modificar el mismo registro en dos devices, sincronizar ambos y verificar que converge al mismo estado (el de mayor (version, updated_at)).

**Acceptance Scenarios**:

1. **Given** el mismo registro editado en 2 devices, **When** ambos sincronizan, **Then** converge determinista al último escritor.
2. **Given** un push duplicado (reintento), **When** llega al server, **Then** es idempotente por id (no duplica).

---

### Edge Cases

- Push/pull duplicados o parciales (red intermitente) → idempotencia por id + reintentos.
- Tombstones vs "resucitar" un registro borrado en otro device.
- Empates de updated_at → desempate por version.
- Reloj del device mal puesto → version como respaldo del orden.
- Ciphertext que el device no puede descifrar (clave equivocada) → error seguro, sin corrupting local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE sincronizar de forma bidireccional (push y pull) entre SQLite local y PostgreSQL.
- **FR-002**: La resolución de conflictos DEBE ser last-write-wins por (version, updated_at).
- **FR-003**: Los borrados DEBEN propagarse como soft-delete (tombstones con deleted_at), nunca borrado físico en sync.
- **FR-004**: La sincronización DEBE ser idempotente por id de registro.
- **FR-005**: El servidor DEBE ordenar y mezclar usando solo metadatos en claro, SIN descifrar ciphertext.
- **FR-006**: El payload DEBE viajar cifrado (envelope, spec 102); solo los metadatos de sync van en claro.
- **FR-007**: El sistema DEBE soportar push/pull parciales y reintentos sin duplicar ni corromper.
- **FR-008**: El merge, la idempotencia y los tombstones DEBEN estar cubiertos por tests (Art. III.4).

### Key Entities

- **SyncRecord (envelope)**: id, user_id, entity_type, version, updated_at, deleted_at, ciphertext.
- **SyncCursor**: punto de sincronización por device (delta desde último sync).
- **Tombstone**: marker de borrado lógico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dos devices con el mismo registro en conflicto convergen al mismo estado en el 100% de los casos.
- **SC-002**: Push/pull duplicados no generan duplicados ni corrupción (idempotencia verificada).
- **SC-003**: El servidor resuelve el sync sin descifrar ningún registro (0 plaintext en server).
- **SC-004**: Un device nuevo rehidrata su histórico completo tras el primer pull.

## Assumptions

- Diferido a v1.0 (el alpha es local-only, sin sync).
- Depende de 100 (fundación), 101 (auth) y 102 (E2EE).
- LWW es suficiente para el modelo de datos de logging (los conflictos complejos son raros); CRDTs quedan fuera de alcance.
