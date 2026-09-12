# Feature Specification: Period & Symptom Logging + Cycle Prediction

**Feature Branch**: `001-period-logging-prediction`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "El loop core del alpha: registrar periodo (inicio/fin/flujo) y síntomas/ánimo, verlos en un calendario empático con las fases del ciclo, obtener predicciones honestas y editar/deshacer registros. Todo offline y privado. Es la feature que valida la retención mes a mes de la UI de Martha."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar el periodo (Priority: P1)

La usuaria marca el inicio (y opcionalmente el fin y el flujo) de su periodo en un día concreto. El registro se guarda al instante y sin conexión.

**Why this priority**: Es el dato raíz del que depende todo (calendario, predicción, histórico). Sin registro no hay app.

**Independent Test**: Abrir el calendario, marcar un día como inicio de periodo, confirmar guardado inmediato; reiniciar la app y verificar que persiste.

**Acceptance Scenarios**:

1. **Given** el calendario del mes actual, **When** la usuaria marca un día como "inicio de periodo", **Then** el día se registra y guarda al instante sin necesidad de red.
2. **Given** un periodo iniciado, **When** la usuaria añade el día de fin y la intensidad de flujo, **Then** el registro se completa y persiste.
3. **Given** un registro guardado, **When** la usuaria reabre la app, **Then** el registro sigue presente.

---

### User Story 2 - Ver el calendario con las fases del ciclo (Priority: P1)

La usuaria ve un calendario mensual que distingue de forma no cromática y accesible los días de periodo, la ventana fértil, la ovulación y el periodo predicho.

**Why this priority**: El calendario es el centro visual de la app (jerarquía del plan de producto) y el principal motor de retorno diario/semanal.

**Independent Test**: Con datos de ejemplo cargados, navegar por los meses y verificar que las fases se representan con forma/icono/etiqueta (no solo color) y que el lector de pantalla las anuncia.

**Acceptance Scenarios**:

1. **Given** al menos un ciclo registrado, **When** la usuaria abre el calendario, **Then** los días de periodo, fértiles y de ovulación se distinguen por forma/icono además de color.
2. **Given** el calendario, **When** un lector de pantalla lo recorre, **Then** cada día anuncia su fase de forma comprensible.
3. **Given** un mes sin datos, **When** la usuaria lo abre, **Then** ve un empty state claro (no un hueco roto).

---

### User Story 3 - Obtener predicciones honestas (Priority: P1)

Tras suficientes ciclos, la usuaria ve la predicción de su próximo periodo y ovulación con una confianza comunicada. Con datos insuficientes (<2 ciclos), la app muestra un estado honesto de "aún no puedo predecir" en lugar de una predicción falsa.

**Why this priority**: La predicción es el valor central; una predicción falsa con pocos datos destruye la confianza (y es un riesgo de salud).

**Independent Test**: Con 0-1 ciclos, verificar el empty state de "sin predicción"; con >=2 ciclos, verificar que aparece una predicción determinista y reproducible.

**Acceptance Scenarios**:

1. **Given** menos de 2 ciclos registrados, **When** la usuaria busca su predicción, **Then** la app muestra "aún no puedo predecir" y NO inventa fechas.
2. **Given** 2 o más ciclos, **When** la usuaria ve la predicción, **Then** se calcula de forma determinista a partir del histórico (mismo input → mismo output).
3. **Given** ciclos muy irregulares, **When** se calcula la predicción, **Then** la app degrada la confianza mostrada en vez de afirmar con certeza.

---

### User Story 4 - Registrar síntomas y ánimo (Priority: P2)

La usuaria registra síntomas físicos y estados de ánimo asociados a un día.

**Why this priority**: Enriquece el histórico y habilita tendencias; complementa el valor core pero no es necesario para la primera predicción.

**Independent Test**: Seleccionar un día, añadir uno o varios síntomas y un ánimo, guardar y verificar persistencia y representación en el calendario/detalle del día.

**Acceptance Scenarios**:

1. **Given** un día seleccionado, **When** la usuaria añade síntomas y ánimo, **Then** se guardan asociados a ese día.
2. **Given** un día con registros, **When** la usuaria lo abre, **Then** ve sus síntomas y ánimo.

---

### User Story 5 - Editar y deshacer registros (Priority: P2)

La usuaria corrige o elimina un registro equivocado, con opción de deshacer.

**Why this priority**: Equivocarse de día es común en logging de salud; sin edición la app se siente frágil (gap UX #7).

**Independent Test**: Editar la fecha de un periodo, guardar, y verificar que calendario y predicción se recalculan; probar "deshacer".

**Acceptance Scenarios**:

1. **Given** un registro existente, **When** la usuaria lo edita o borra, **Then** el cambio persiste y el calendario/predicción se recalculan.
2. **Given** una acción destructiva, **When** la usuaria pulsa "deshacer", **Then** el registro se restaura.

---

### User Story 6 - Revisar el histórico (Priority: P3)

La usuaria revisa sus ciclos pasados (vista de ~3 meses), base del futuro PDF médico.

**Why this priority**: Aporta contexto y confianza; prepara el terreno para el reporte médico, pero no es crítica para validar retención.

**Independent Test**: Con varios ciclos, abrir el histórico y verificar la lista de ciclos pasados con sus fechas.

**Acceptance Scenarios**:

1. **Given** varios ciclos registrados, **When** la usuaria abre el histórico, **Then** ve sus ciclos pasados ordenados por fecha.

---

### Edge Cases

- Menos de 2 ciclos: sin predicción (empty state honesto).
- Ciclos muy irregulares, o estados vitales (anticonceptivos hormonales, embarazo, posparto, perimenopausia, SOP/PCOS): la predicción degrada con gracia y no afirma con falsa confianza.
- Cambios de DST / zona horaria / reloj del dispositivo mal puesto: las fechas se guardan en UTC/ISO y el cálculo es determinista.
- Registrar una fecha futura o un periodo que se solapa con otro.
- Almacenamiento lleno al guardar (estado de error amable).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La usuaria DEBE poder registrar inicio, fin e intensidad de flujo de un periodo en un día.
- **FR-002**: La usuaria DEBE poder registrar síntomas y ánimo por día.
- **FR-003**: El sistema DEBE mostrar un calendario mensual con las fases del ciclo (periodo, fértil, ovulación, predicho) distinguibles sin depender solo del color.
- **FR-004**: El sistema DEBE calcular el próximo periodo y ovulación a partir del histórico, de forma determinista y reproducible.
- **FR-005**: El sistema DEBE exigir un mínimo de datos (>=2 ciclos) antes de mostrar predicción; en su defecto, mostrar un estado "sin predicción".
- **FR-006**: El sistema DEBE degradar la confianza de la predicción ante ciclos irregulares o estados vitales, sin afirmar con falsa certeza.
- **FR-007**: La usuaria DEBE poder editar y borrar cualquier registro, con opción de deshacer.
- **FR-008**: El sistema DEBE persistir todos los registros localmente y offline (sobre la fundación del spec 000).
- **FR-009**: El sistema DEBE almacenar fechas en UTC/ISO y calcular en un módulo de fechas puro y testeable.
- **FR-010**: El calendario y las fases DEBEN ser accesibles (lector de pantalla, contraste, daltonismo, Dynamic Type).
- **FR-011**: El sistema DEBE proveer empty states (primer arranque, mes vacío, sin predicción) y error states (escritura falla).

### Key Entities

- **Cycle**: un ciclo menstrual (fecha de inicio, longitud estimada, regularidad).
- **PeriodLog**: registro de periodo (día, inicio/fin, flujo).
- **SymptomLog**: síntoma asociado a un día.
- **MoodLog**: estado de ánimo asociado a un día.
- **Prediction**: próxima ventana fértil/ovulación/periodo + nivel de confianza + nº de ciclos usados.
- **CalendarDay**: proyección visual de un día con su(s) fase(s) y registros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La usuaria puede registrar un periodo en <15 segundos desde que abre la app.
- **SC-002**: 0 predicciones falsas mostradas con <2 ciclos (siempre estado "sin predicción").
- **SC-003**: El calendario mensual renderiza en <1s en un dispositivo de gama media.
- **SC-004**: El 100% de los registros editados/borrados recalculan calendario y predicción correctamente.
- **SC-005**: Proxy de retención: las testers vuelven a registrar en semanas consecutivas durante el alpha (medible vía analítica del spec 003).
- **SC-006**: La lógica de predicción pasa unit tests incluidos los edge cases (DST, <2 ciclos, irregulares).

## Assumptions

- El algoritmo de predicción es heurístico y determinista (p. ej. media de longitudes de ciclo), sin ML en el alpha.
- Martha aporta la jerarquía visual del calendario, los iconos/formas de fases (no solo color) y los empty/error states.
- La terminología es i18n-aware y hay dark mode (gap UX #11).
- Construye sobre la fundación local/cifrada del spec 000; sin backend.
- Los estados vitales (embarazo, SOP, etc.) se manejan como degradación de la predicción + UI, no como módulos clínicos.
