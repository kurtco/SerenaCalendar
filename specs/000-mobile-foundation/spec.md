# Feature Specification: Mobile Foundation (Walking Skeleton)

**Feature Branch**: `000-mobile-foundation`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Fundación del alpha MVP: una app instalable en ~10 dispositivos (fuera de tiendas), offline-first, con arquitectura limpia, persistencia local cifrada en reposo y distribución a testers. Es el esqueleto sobre el que se construyen todas las features del alpha."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instalar y arrancar en dispositivos reales (Priority: P1)

Una tester recibe el build del alpha, lo instala en su teléfono (iOS o Android) sin pasar por una tienda pública, y la app arranca hasta la pantalla de bienvenida/onboarding. Funciona por completo sin conexión.

**Why this priority**: Sin un build instalable que arranque offline no hay alpha que distribuir ni nada que validar (ni retención ni ingresos).

**Independent Test**: Generar el build por la pipeline de distribución, instalarlo en un device iOS y uno Android, activar modo avión y confirmar que arranca hasta onboarding sin llamadas de red.

**Acceptance Scenarios**:

1. **Given** un dispositivo de tester, **When** instala el build firmado del alpha y lo abre, **Then** la app hace cold-start hasta la pantalla de onboarding sin crashear.
2. **Given** modo avión activado, **When** la tester abre la app, **Then** todas las pantallas core renderizan y las acciones locales funcionan sin red.
3. **Given** un segundo arranque, **When** la app inicializa el almacenamiento local, **Then** reutiliza los datos persistidos (no se resetea).

---

### User Story 2 - Persistencia local privada (Priority: P1)

Los datos de salud que la tester registra se guardan en el dispositivo cifrados en reposo y sobreviven al reinicio de la app. El backup del sistema operativo no copia la base de datos de salud a la nube.

**Why this priority**: Aunque sea un alpha cerrado, se manipulan datos menstruales reales; la promesa de privacidad (onboarding de confianza de Martha) debe ser real desde el primer build.

**Independent Test**: Registrar un dato de ejemplo, forzar cierre y reabrir (el dato persiste); inspeccionar el almacenamiento en el device para confirmar que los campos sensibles no están en claro; verificar los flags de backup.

**Acceptance Scenarios**:

1. **Given** un registro guardado, **When** la app se cierra por completo y se reabre, **Then** el registro sigue presente.
2. **Given** la base de datos local, **When** se inspeccionan los campos sensibles en reposo, **Then** están cifrados (no hay valores de salud en texto plano).
3. **Given** la configuración de backup del OS, **When** la app está instalada, **Then** la base de datos de salud queda excluida del backup en la nube del OS.

---

### User Story 3 - Boundaries de arquitectura limpia exigibles (Priority: P2)

El equipo de desarrollo tiene un esqueleto con Clean Architecture (presentation → domain ← data) donde el dominio es puro y testeable, el estado de UI vive solo en presentation y la persistencia solo en data.

**Why this priority**: Previene la erosión arquitectónica a medida que se añaden features; el walking skeleton demuestra que las fronteras aguantan punta a punta.

**Independent Test**: Cablear un caso de uso trivial (p. ej. alternar una preferencia) que atraviese presentation → domain ← data y verificar que el dominio no importa UI ni BD, y que un store no importa persistencia.

**Acceptance Scenarios**:

1. **Given** el esqueleto, **When** se cablea un caso de uso trivial a través de las capas, **Then** funciona sin que el dominio importe UI ni BD.
2. **Given** las reglas de dependencia, **When** código de presentation intenta importar persistencia directamente, **Then** el build/lint falla.

---

### Edge Cases

- ¿Qué pasa en versiones de OS donde el secure storage o la New Architecture fallan?
- ¿Cómo se comporta la app con almacenamiento del dispositivo casi lleno (escritura falla)?
- ¿Qué ocurre en el primer cold-start cuando hay que correr migraciones por primera vez?
- ¿Cómo se degrada la experiencia en un device con OS antiguo/no soportado?
- ¿Qué pasa si la tester reinstala el build (los datos locales se pierden en el alpha, es esperado)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE generar builds firmados instalables para iOS (TestFlight interno/ad-hoc) y Android (APK/sideload) sin tienda pública.
- **FR-002**: El sistema DEBE arrancar y ser plenamente usable sin conexión (offline-first, sin backend en el alpha).
- **FR-003**: El sistema DEBE persistir datos de dominio localmente entre reinicios mediante una base de datos local versionada con migraciones.
- **FR-004**: El sistema DEBE cifrar los datos de salud en reposo (nivel field-level), con claves en el secure storage de la plataforma.
- **FR-005**: El sistema DEBE deshabilitar el backup en la nube del OS para la base de datos de salud (`android:allowBackup=false`; exclusión de backup / file protection en iOS).
- **FR-006**: El sistema DEBE exigir los boundaries de Clean Architecture (presentation → domain ← data; dominio puro; estado solo en presentation; persistencia solo en data).
- **FR-007**: El sistema DEBE separar preferencias/estado efímero (tema, flags de onboarding) de los datos de dominio.
- **FR-008**: El sistema DEBE proveer un entorno de desarrollo reproducible y tooling (lint, formato, tests) consistente.
- **FR-009**: El sistema DEBE mostrar estados base (splash/cold-start, empty state inicial) coherentes con el diseño de Martha.

### Key Entities

- **LocalDatabase**: almacén on-device versionado para registros de dominio; soporta migraciones.
- **SecureKeyStore**: almacenamiento protegido por la plataforma para claves de cifrado.
- **Preferences**: ajustes y flags efímeros, separados del dominio.
- **ArchitectureLayers**: presentation, domain y data con reglas de dependencia exigibles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una tester no-desarrolladora puede instalar el alpha en un iOS y un Android y llegar a onboarding en <3 minutos sin soporte.
- **SC-002**: El 100% de los flujos core funcionan con la red completamente deshabilitada.
- **SC-003**: Tras cerrar y reabrir la app, el 100% de los datos registrados previamente siguen presentes.
- **SC-004**: 0 valores de salud en texto plano son descubribos en el almacenamiento del dispositivo en reposo.
- **SC-005**: La inspección del backup del OS confirma que la base de datos de salud está excluida.
- **SC-006**: Las violaciones de dependencia de arquitectura hacen fallar el build/lint (0 violaciones pasan).

## Assumptions

- Las testers usan versiones de iOS/Android razonablemente recientes y soportadas por el SDK de Expo elegido.
- El alpha es offline-only; sin backend, auth ni sync (diferido a v1.0 según Alcance por Fases de la constitución).
- La distribución usa firmado de desarrollador (cuenta Apple Developer para TestFlight/ad-hoc; sideload en Android).
- Martha aporta los diseños de onboarding/bienvenida; esta spec cubre el shell técnico que los hospeda.
- Field-level es el nivel de cifrado at-rest del alpha (Art. I.8 de la constitución).
- Se requiere custom dev build (Expo Go no soporta AdMob ni crypto nativo).
