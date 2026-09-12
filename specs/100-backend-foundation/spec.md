# Feature Specification: Backend Foundation (Durable Tier)

**Feature Branch**: `100-backend-foundation`

**Created**: 2026-09-12

**Status**: Draft (DIFERIDO — refinar tras validación del alpha; ver Alcance por Fases de la constitución y principio YAGNI)

**Input**: User description: "Fundación del servidor durable (v1.0): API que hospedará cuentas de usuaria y datos de sync cifrados (E2EE), con base de datos relacional durable, migraciones versionadas, health checks, logging sin PII y CI. Gate obligatorio antes del lanzamiento público."

> Nota: esta spec es committed-scope para v1.0 pero se escribirá en detalle justo antes de implementarse (just-in-time), una vez el alpha valide retención e ingresos. Stack fijado por constitución (Art. VI).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Almacén durable con migraciones seguras (Priority: P1)

El sistema cuenta con una base de datos relacional durable (copia canónica que sobrevive a borrar la app / cambiar de dispositivo) y un runner de migraciones versionado que evoluciona el schema sin perder ni corromper datos.

**Why this priority**: Es la garantía de "no perder la data" (gap #5) y el prerrequisito de sync y auth.

**Independent Test**: Levantar el servicio, correr migraciones desde vacío, sembrar datos, aplicar una migración aditiva y verificar integridad; reproduccibilidad en CI.

**Acceptance Scenarios**:

1. **Given** una base vacía, **When** se aplican las migraciones, **Then** el schema queda consistente y versionado.
2. **Given** datos existentes, **When** se aplica una nueva migración, **Then** los datos previos permanecen intactos.

---

### User Story 2 - Fundación de API con health y configuración (Priority: P1)

El servicio expone una base de API (health endpoint, configuración por entorno, logging estructurado sin PII) y una pipeline CI que corre lint y tests.

**Why this priority**: Sin una base de API sana y observable no se pueden montar auth ni sync encima.

**Independent Test**: Arrancar el servicio, golpear el health endpoint, verificar configuración por env y que los logs no contienen PII; ejecutar CI.

**Acceptance Scenarios**:

1. **Given** el servicio arrancado, **When** se consulta el health endpoint, **Then** responde correctamente.
2. **Given** cualquier log, **When** se inspecciona, **Then** no contiene datos de salud ni PII.

---

### User Story 3 - Entorno local reproducible (Priority: P2)

El equipo puede levantar backend + base de datos localmente con un solo comando para desarrollar y testear.

**Why this priority**: Acelera el desarrollo y garantiza reproducibilidad.

**Independent Test**: Ejecutar el comando de bootstrap local y verificar que servicio y BD quedan operativos.

**Acceptance Scenarios**:

1. **Given** una máquina limpia, **When** se ejecuta el bootstrap local, **Then** backend y BD quedan listos.

---

### Edge Cases

- Migración que falla a mitad → estrategia de rollback/transaccional.
- Conexión a BD caída → health degradado y respuestas de error sanas.
- Configuración ausente (secretos/env) → arranque falla de forma explícita, no silenciosa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proveer un servicio API (FastAPI) con health endpoint.
- **FR-002**: El sistema DEBE usar una base de datos relacional durable (PostgreSQL) como copia canónica.
- **FR-003**: El sistema DEBE versionar el schema con migraciones (Alembic) desde el día 1, sin pérdida de datos.
- **FR-004**: El sistema DEBE crear en la migración inicial las tablas base: `users` y `sync_records` (envelope: metadatos en claro + ciphertext).
- **FR-005**: El sistema DEBE configurarse por entorno (12-factor) sin secretos en el repo.
- **FR-006**: El logging DEBE ser estructurado y sin PII/datos de salud.
- **FR-007**: El sistema DEBE tener CI que ejecute lint (ruff) y tests (pytest) en verde como gate.
- **FR-008**: El sistema DEBE poder levantarse localmente (BD + servicio) con un comando.
- **FR-009**: El servidor NUNCA DEBE almacenar ni procesar datos de salud en claro (solo ciphertext) — constitución Art. I.

### Key Entities

- **User**: cuenta (placeholder hasta auth, spec 101).
- **SyncRecord**: envelope de sync (id, user_id, entity_type, version, updated_at, deleted_at, ciphertext).
- **MigrationHistory**: registro versionado de cambios de schema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las migraciones se reproducen desde vacío y sobre datos existentes con 0 pérdida de datos.
- **SC-002**: CI en verde (lint + tests) bloquea merges rotos (0 merges con CI roja).
- **SC-003**: El health endpoint responde y refleja el estado de dependencias.
- **SC-004**: 0 datos de salud en claro almacenados o logueados en el servidor.
- **SC-005**: El entorno local arranca con un solo comando en <2 minutos.

## Assumptions

- Diferido hasta que el alpha valide mercado (YAGNI, constitución Governance).
- Stack según Art. VI: Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL 17 (dev local → prod Neon).
- Auth (101), E2EE (102) y sync (103) se montan sobre esta fundación.
- Los comentarios del código Python siguen la convención pedagógica (Art. IX).
