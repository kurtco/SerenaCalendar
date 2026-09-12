# Feature Specification: Fail-Open Monetization (AdMob)

**Feature Branch**: `002-monetization-fail-open`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Monetización no intrusiva con AdMob para validar ingresos en el alpha: rewarded para desbloqueos cosméticos (fail-open si no hay fill), banners en pantallas secundarias e intersticiales con cap de 48h en transiciones no sensibles. Ninguna feature crítica de salud ni el PDF médico se bloquean por anuncios."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rewarded cosmético fail-open (Priority: P1)

La usuaria ve un video de ~30s para desbloquear una micro-feature cosmética (temas/iconos, tendencias avanzadas). Si AdMob no sirve el anuncio (0% fill) tras reintentos acotados y timeout, el desbloqueo se concede gratis y se registra `reward_granted_fallback`.

**Why this priority**: Es el vector principal de validación de ingresos del alpha, y la regla fail-open evita dejar a la usuaria bloqueada (gap negocio #1).

**Independent Test**: Simular 0% fill y confirmar que la usuaria obtiene el desbloqueo gratis (fail-open) y que se emite `reward_granted_fallback`; con fill normal, confirmar el flujo ver-anuncio→desbloquear.

**Acceptance Scenarios**:

1. **Given** fill disponible, **When** la usuaria completa el video, **Then** se desbloquea la feature cosmética y se registra `rewarded_completed`.
2. **Given** 0% fill, **When** la usuaria intenta desbloquear y se agotan reintentos+timeout, **Then** se concede el desbloqueo gratis y se registra `reward_granted_fallback`.
3. **Given** un video cerrado a medias, **When** la usuaria lo cierra antes del final, **Then** NO se concede la recompensa y se comunica claramente (vista parcial = sin recompensa).

---

### User Story 2 - Nada crítico bloqueado por anuncios (Priority: P1)

Ninguna feature crítica de salud (registro, calendario, predicción) ni el PDF médico se bloquean por falta de anuncio o por cualquier estado publicitario.

**Why this priority**: Regla ética y de store review no negociable (constitución VIII.1 y VIII.2); además reduce riesgo de rechazo en tiendas.

**Independent Test**: Con anuncios deshabilitados/sin fill, recorrer registro, calendario, predicción y PDF médico y confirmar que todo funciona sin gates.

**Acceptance Scenarios**:

1. **Given** AdMob sin fill o caído, **When** la usuaria usa cualquier feature de salud, **Then** no encuentra ningún bloqueo ni pantalla de "ver anuncio".
2. **Given** el PDF médico, **When** la usuaria lo genera, **Then** es gratis y on-device, jamás tras un rewarded.

---

### User Story 3 - Banners de baja intrusión (Priority: P2)

La usuaria ve banners solo en pantallas secundarias (Ajustes, Historial), sin tapar el calendario principal ni los botones de registro.

**Why this priority**: Ingreso pasivo sin dañar la experiencia ni provocar clics accidentales cerca de acciones íntimas.

**Independent Test**: Navegar por Ajustes/Historial y verificar presencia y ubicación del banner; verificar ausencia en el calendario principal y junto a botones de registro; probar el comportamiento sin fill (colapsar/reservar espacio sin saltos de layout).

**Acceptance Scenarios**:

1. **Given** una pantalla secundaria, **When** hay fill, **Then** el banner se muestra sin tapar controles críticos.
2. **Given** sin fill, **When** se carga la pantalla, **Then** el hueco del banner se colapsa o reserva espacio sin saltos de layout bruscos.

---

### User Story 4 - Intersticial con cap de 48h en transición no sensible (Priority: P2)

La usuaria ve como máximo 1 intersticial cada 48h, en una transición no sensible, y NUNCA justo después de guardar su periodo.

**Why this priority**: Alta conversión pero alto riesgo de dañar la percepción de marca si aparece en un momento íntimo/vulnerable (gap negocio #3).

**Independent Test**: Forzar varias transiciones y confirmar que no se muestra más de 1 intersticial por cada 48h (timestamp local), y que nunca se dispara tras guardar un registro de periodo.

**Acceptance Scenarios**:

1. **Given** un intersticial mostrado, **When** ocurre otra transición elegible dentro de 48h, **Then** no se muestra otro.
2. **Given** la usuaria acaba de guardar su periodo, **When** vuelve a la pantalla principal, **Then** NO se dispara intersticial.

---

### Edge Cases

- Fill rate 0% prolongado → todo sigue fail-open, nada bloqueado.
- Consentimiento no otorgado (ver spec 003) → no se cargan anuncios personalizados; comportamiento acorde a UMP/ATT.
- Usuaria cierra el rewarded a medias → sin recompensa, comunicado.
- Contador de cap debe persistir entre reinicios (timestamp local), independiente de AdMob.
- Categoría sensible: si AdMob limita la categoría de salud/menstruación, el modelo de ingresos cae (gap negocio #6) → riesgo a monitorear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir desbloquear micro-features cosméticas vía rewarded (temas/iconos, tendencias avanzadas).
- **FR-002**: El sistema DEBE ser fail-open: ante falta de fill tras reintentos acotados + timeout, concede la recompensa gratis y registra `reward_granted_fallback`.
- **FR-003**: El estado "recompensa disponible/concedida" DEBE vivir en la lógica local, no depender del SDK.
- **FR-004**: El sistema DEBE impedir que cualquier feature crítica de salud o el PDF médico se bloqueen por anuncios.
- **FR-005**: El sistema DEBE mostrar banners solo en pantallas secundarias, sin tapar el calendario ni botones de registro.
- **FR-006**: El sistema DEBE limitar intersticiales a 1 cada 48h mediante timestamp local persistente, y nunca en momentos íntimos (p. ej. tras guardar periodo).
- **FR-007**: Todo acceso a anuncios DEBE pasar por una abstracción `AdsService` (interfaz en domain, implementación en data).
- **FR-008**: La carga de anuncios DEBE estar gateada por el consentimiento (UMP/GDPR + ATT) del spec 003.
- **FR-009**: El sistema DEBE instrumentar eventos de monetización: `fill_rate`, `eCPM` por formato, `rewarded_started/completed/skipped`, `interstitial_shown` vs cap, `reward_granted_fallback`.
- **FR-010**: El sistema DEBE comunicar claramente el flujo rewarded (qué desbloquea, duración, consecuencia de cerrar a medias).

### Key Entities

- **AdUnit**: banner / intersticial / rewarded con su formato y ubicación permitida.
- **RewardGrant**: desbloqueo concedido (por video completado o por fallback fail-open).
- **FrequencyCap**: timestamp local del último intersticial (48h).
- **ConsentState**: estado de consentimiento que gatea la carga de anuncios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 features críticas de salud o PDF médico bloqueados por estado publicitario alguno.
- **SC-002**: Ante 0% fill, la recompensa se concede gratis (fail-open) sin dejar a la usuaria bloqueada, en <10s desde el intento.
- **SC-003**: Nunca se muestran >1 intersticial por cada 48h por dispositivo.
- **SC-004**: 0 banners tapan el calendario principal o botones de registro.
- **SC-005**: Las señales de ingreso (fill_rate, eCPM, rewarded completion) quedan disponibles para validar el modelo de negocio del alpha.

## Assumptions

- Cuenta AdMob configurada, `app-ads.txt` publicado y account linking hecho; política de categoría de salud confirmada (gap negocio #6) — riesgo abierto.
- Rewarded se reserva a lo cosmético/nice-to-have; lo crítico de salud y el PDF médico son gratis.
- El consentimiento (UMP/GDPR + iOS ATT) se gestiona en el spec 003 y gatea esta feature.
- Se requiere custom dev build (Expo Go no soporta AdMob).
- La validación de ingresos del alpha depende de fill real en los dispositivos de las testers.
