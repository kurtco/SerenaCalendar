# Feature Specification: Medical PDF Report (Free, On-Device)

**Feature Branch**: `004-medical-pdf`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Reporte PDF estructurado del historial reciente (últimos ~3 meses: ciclos, periodos, síntomas, ánimo) para mostrar al ginecólogo. Gratis y generado on-device, NUNCA gateado tras un anuncio rewarded. Decisión ética y de store review (constitución VIII.2)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generar el reporte médico (Priority: P1)

La usuaria genera un PDF estructurado con su historial reciente (por defecto últimos 3 meses) para llevarlo a su médico. Es gratis y se genera en el dispositivo.

**Why this priority**: Es un diferenciador de producto de alto valor en contexto de salud y una obligación ética que no se gatea con publicidad.

**Independent Test**: Con histórico de ejemplo, generar el PDF y verificar que incluye ciclos/periodos/síntomas/ánimo del rango elegido, y que no aparece ningún gate de anuncio.

**Acceptance Scenarios**:

1. **Given** histórico suficiente, **When** la usuaria genera el reporte, **Then** se produce un PDF estructurado con los últimos ~3 meses.
2. **Given** la generación, **When** se completa, **Then** NO se exigió ver ningún anuncio (gratis siempre).
3. **Given** sin conexión, **When** la usuaria genera el PDF, **Then** funciona on-device (no requiere red).

---

### User Story 2 - Exportar / compartir el reporte (Priority: P2)

La usuaria comparte o guarda el PDF mediante la hoja de compartir del sistema.

**Why this priority**: El valor está en llevarlo al médico; sin exportación el reporte queda atrapado en la app.

**Independent Test**: Generar el PDF y usar la share sheet para guardarlo en Files o enviarlo; verificar integridad del archivo.

**Acceptance Scenarios**:

1. **Given** un PDF generado, **When** la usuaria usa "compartir/guardar", **Then** el archivo se exporta correctamente vía OS.

---

### User Story 3 - Elegir rango y contenido (Priority: P3)

La usuaria ajusta el rango temporal y qué secciones incluir (p. ej. solo periodos, o con síntomas/ánimo).

**Why this priority**: Distintas consultas necesitan distinto nivel de detalle; mejora la utilidad sin ser crítico.

**Independent Test**: Cambiar rango/secciones y regenerar; verificar que el PDF refleja la selección.

**Acceptance Scenarios**:

1. **Given** la pantalla de reporte, **When** la usuaria cambia rango o secciones y regenera, **Then** el PDF refleja la selección.

---

### Edge Cases

- Histórico vacío → estado claro ("no hay datos suficientes para el reporte").
- Fallo de generación (memoria/permisos) → error state amable con reintento.
- Rango muy grande → rendimiento y legibilidad.
- Privacidad del contenido compartido (el PDF sale del entorno cifrado de la app) → la usuaria debe entenderlo.
- Idioma/formato de fechas del PDF (i18n).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE generar un PDF estructurado del historial (ciclos, periodos, síntomas, ánimo) de un rango temporal (por defecto ~3 meses).
- **FR-002**: La generación DEBE ser on-device (coherente con privacidad/E2EE; sin enviar datos de salud a un servidor).
- **FR-003**: El reporte DEBE ser gratis siempre y NUNCA gateado tras un rewarded u otro anuncio.
- **FR-004**: La usuaria DEBE poder exportar/compartir el PDF vía la hoja de compartir del OS.
- **FR-005**: La usuaria DEBE poder elegir rango y secciones a incluir.
- **FR-006**: El sistema DEBE manejar empty state (sin datos) y error state (fallo de generación) con claridad.
- **FR-007**: El PDF DEBE respetar i18n (idioma y formatos de fecha locales).
- **FR-008**: El sistema DEBE informar a la usuaria de que el PDF exportado sale del entorno protegido de la app.

### Key Entities

- **MedicalReport**: rango temporal + secciones incluidas + datos agregados del histórico.
- **PdfDocument**: archivo generado, exportable/compartible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La usuaria puede generar y compartir el PDF en <30s desde la pantalla de reporte.
- **SC-002**: 0 gates publicitarios en el flujo de PDF médico (gratis en el 100% de los casos).
- **SC-003**: El PDF refleja con exactitud el histórico del rango elegido (verificable contra los datos locales).
- **SC-004**: La generación funciona 100% offline.

## Assumptions

- Generación on-device (p. ej. expo-print/HTML→PDF); la elección técnica se fija en `/speckit.plan`.
- El contenido es informativo, NO un diagnóstico médico.
- Martha diseña la plantilla del PDF (legible, imprimible, apta para consulta).
- Construye sobre el histórico del spec 001 y la fundación del spec 000.
- En el alpha no hay backend; el PDF se genera con datos locales.
