# Feature Specification: Consent & Privacy-Safe Analytics

**Feature Branch**: `003-analytics-consent`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Consentimiento (Google UMP GDPR/CCPA + iOS ATT, con soft-ask previo) y analítica anónima y agregada —sin datos de salud ni PII— para medir la validación del alpha: retención (funnel, D1/D7/D30) e ingresos (eventos de monetización). Crash reporting con scrubbing de PII."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Puerta de consentimiento antes de anuncios/analítica (Priority: P1)

Antes de cargar anuncios o analítica, la app pide consentimiento (UMP para GDPR/CCPA; ATT en iOS), precedido de un soft-ask que explica el "por qué" en lenguaje claro.

**Why this priority**: Obligatorio legalmente (EEA/UK) y requisito de política de AdMob/Apple; además condiciona que el resto de métricas sean válidas.

**Independent Test**: Primer arranque → verificar que aparece el soft-ask y luego el diálogo nativo en el orden correcto; denegar y confirmar que no se cargan anuncios personalizados ni analítica no permitida.

**Acceptance Scenarios**:

1. **Given** primer arranque, **When** la app necesita consentimiento, **Then** muestra primero el soft-ask explicativo y después el diálogo nativo (UMP/ATT), nunca en frío.
2. **Given** consentimiento denegado, **When** la app continúa, **Then** no se cargan anuncios personalizados y la analítica se limita a lo permitido sin PII.
3. **Given** una usuaria en EEA/UK, **When** se van a servir anuncios, **Then** el flujo UMP se completa antes de la carga.

---

### User Story 2 - Métricas de validación del alpha (Priority: P1)

El equipo ve funnel y retención (onboarding_completed, first_period_logged, D1/D7/D30) y métricas de monetización, todo anónimo y agregado.

**Why this priority**: Es lo que permite decidir si la UI de Martha retiene y si AdMob genera ingresos — el objetivo declarado del alpha.

**Independent Test**: Provocar eventos de funnel y monetización en un device y verificar que llegan agregados, sin PII ni datos de salud, al tooling de analítica.

**Acceptance Scenarios**:

1. **Given** una tester completa el onboarding, **When** termina, **Then** se emite `onboarding_completed` sin PII.
2. **Given** una tester registra su primer periodo, **When** guarda, **Then** se emite `first_period_logged` (sin detalles clínicos).
3. **Given** actividad de anuncios, **When** ocurren impresiones/rewards, **Then** se emiten los eventos de monetización del spec 002.

---

### User Story 3 - Respetar y poder cambiar el consentimiento (Priority: P2)

La usuaria puede revisar y cambiar sus preferencias de consentimiento/privacidad en cualquier momento.

**Why this priority**: Requisito de compliance y de confianza (onboarding de privacidad prometido).

**Independent Test**: Cambiar la preferencia de consentimiento en Ajustes y verificar que la app la respeta en la siguiente carga de anuncios/analítica.

**Acceptance Scenarios**:

1. **Given** Ajustes, **When** la usuaria cambia su consentimiento, **Then** la nueva preferencia se aplica a anuncios y analítica.

---

### Edge Cases

- ATT denegado en iOS → anuncios no personalizados / menor eCPM (esperado), app sigue funcional.
- Consentimiento retirado a mitad de sesión.
- Diferentes jurisdicciones (EEA/UK vs resto) con requisitos distintos.
- Riesgo de fuga de PII en un evento mal diseñado → whitelist estricta de eventos.
- Crash que contiene datos de síntomas → Sentry con scrubbing (gap técnico #8).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar el flujo de consentimiento UMP (GDPR/CCPA) antes de cargar anuncios, gateando EEA/UK.
- **FR-002**: El sistema DEBE solicitar ATT en iOS con un soft-ask previo que explique el motivo.
- **FR-003**: El orden de pedido de permisos en onboarding DEBE ser deliberado (soft-ask → diálogo nativo), nunca en frío.
- **FR-004**: La analítica DEBE ser anónima y agregada, sin datos de salud ni PII, y tras consentimiento.
- **FR-005**: El sistema DEBE emitir eventos de funnel/retención: `onboarding_completed`, `first_period_logged`, y señales para D1/D7/D30.
- **FR-006**: El sistema DEBE emitir/propagar eventos de monetización (definidos en spec 002).
- **FR-007**: Los eventos DEBEN salir de una whitelist explícita (nada de eventos ad-hoc con datos sensibles).
- **FR-008**: El sistema DEBE permitir revisar y cambiar el consentimiento en Ajustes.
- **FR-009**: El crash reporting (Sentry) DEBE aplicar scrubbing de PII/datos de salud.
- **FR-010**: El sistema DEBE respetar "no cargar anuncios personalizados ni analítica no permitida" cuando el consentimiento se deniega/retira.

### Key Entities

- **ConsentState**: UMP (GDPR/CCPA) + ATT, con timestamp y alcance.
- **AnalyticsEvent**: evento de whitelist (nombre + propiedades no sensibles).
- **FunnelMetric**: onboarding_completed, first_period_logged, retención D1/D7/D30.
- **PrivacyPreference**: preferencias revisables por la usuaria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 eventos de analítica contienen datos de salud o PII.
- **SC-002**: El 100% de las cargas de anuncio están gateadas por consentimiento válido.
- **SC-003**: Retención D1/D7/D30 y funnel son medibles y visibles para el equipo durante el alpha.
- **SC-004**: Las métricas de monetización (fill_rate, eCPM, rewarded completion, interstitial vs cap) están disponibles para decidir el modelo de negocio.
- **SC-005**: 0 crashes reportados contienen síntomas/datos sensibles (scrubbing verificado).

## Assumptions

- **Tooling de analítica pendiente de decisión** (gap negocio #5): Firebase sin PII / PostHog self-host / Amplitude. La spec es agnóstica; la elección se fija en `/speckit.plan`.
- Existe una política de privacidad y el onboarding de confianza de Martha la explica.
- Los eventos son una whitelist cerrada; cualquier evento nuevo se revisa por privacidad.
- La analítica del alpha solo busca validar retención e ingresos; no producto analytics avanzado.
