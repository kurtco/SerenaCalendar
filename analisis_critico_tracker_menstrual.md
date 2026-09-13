# Análisis Crítico: Tracker de Ciclo Menstrual

**Documento derivado de:** `plan_tracker_menstrual.md`
**Rol:** Co-Lead Técnico · **Destinatario:** Lead Developer / Product Owner
**Estado del proyecto:** Walking skeleton `000-mobile-foundation` en progreso. Consumo del design system (`@repo/ui-native`) verificado en simulador iOS con Expo SDK 57. Persistencia local (Drizzle + expo-sqlite), cifrado field-level AES-256-GCM, migraciones versionadas, Clean Architecture, ESLint boundaries, MMKV/Zustand y configuración EAS implementados. Build EAS + Apple Developer (99 USD) diferidos. `expo run:ios` local bloqueado por incompatibilidad del entorno (Xcode SDK 26.5 vs runtimes iOS 18.3/18.4), no por el código. Pendiente: `.env.example` y tests de integración de repositorios en un simulador/dispositivo compatible.

---

<analisis_critico>

## Gaps Técnicos

El documento dice "almacenamiento local (Offline-first)" y ahí se queda. Eso no es una decisión de arquitectura, es una intención. Faltan cosas que, si no se resuelven antes de escribir código, cuestan una reescritura.

### 1. Modelo de persistencia sin definir (gap más grave)
Se mezclan dos necesidades distintas:
- **Datos de dominio consultables/relacionales** (ciclos, periodos, síntomas, estados de ánimo, histórico de 3 meses para el PDF). Esto NO es un KV. Necesita **SQLite** (`expo-sqlite` + Drizzle ORM, o `op-sqlite`). Guardar series temporales de salud en MMKV/AsyncStorage lleva a queries en JS y O(n) por pantalla.
- **Preferencias y estado efímero** (flags de onboarding, tema, contador de frequency capping). Esto sí es **MMKV** + `zustand/middleware/persist`.

Decisión: SQLite para dominio, MMKV para prefs. Sin esta frontera, la Clean Architecture se contamina.

### 2. Migraciones de schema: cero mención
El schema de una app de salud evoluciona sí o sí. Sin un runner de migraciones versionado desde el día 1, la primera actualización que toque el schema **borra o corrompe los datos locales**. Drizzle tiene migrations; cablearlas en el bootstrap, no "para después".

### 3. Cifrado en reposo
Se promete privacidad de datos de salud pero se guardan en claro. Salud = categoría especial (GDPR art. 9). Cifrado at-rest: SQLCipher sobre SQLite o cifrado a nivel de campo con claves en `expo-secure-store` (Keychain/Keystore).

### 4. Permisos de OS: ignorados por completo
- **Notificaciones:** core de un tracker (recordatorios de periodo/ovulación) y no aparece. Android 13+ exige `POST_NOTIFICATIONS` en runtime; iOS pasa por `UNUserNotificationCenter`. Falta el flujo entero.
- **iOS ATT:** aunque no se compartan datos de salud, AdMob personaliza a nivel de dispositivo. Sin `AppTrackingTransparency` + `SKAdNetworkItems` en `Info.plist`, en iOS se sirven anuncios de bajo eCPM o se incumple política.
- **Google UMP (GDPR/CCPA):** `react-native-google-mobile-ads` trae Consent Flow integrado. Obligatorio para EEA/UK antes de cargar anuncios. No mencionado.

### 5. Cambio de dispositivo sin backend = pérdida total
Offline-first puro significa que al cambiar de móvil o reinstalar, **se pierde todo el historial médico**. Reverso crítico: el backup automático de iOS/Android puede estar copiando la BD de salud a la nube del OS sin control (fuga de privacidad). Decidir explícitamente: export/import cifrado por archivo, backup opcional a iCloud/Drive, y configurar `android:allowBackup` conscientemente.

### 6. Lógica de fechas y predicción
Todo el valor es cálculo de fechas. DST, cambios de zona horaria, reloj mal puesto y ciclos irregulares rompen predicciones ingenuas. Estrategia determinista: guardar en UTC/ISO, calcular en módulo puro y testeable, y definir cuántos ciclos hacen falta antes de predecir (con 0-1 registros no se puede predecir).

### 7. Compatibilidad Nueva Arquitectura no verificada
Se asume que `react-native-google-mobile-ads` y `expo-print` funcionan sobre Fabric/TurboModules. Validar versiones contra el SDK de Expo elegido ANTES de comprometerse a New Architecture.

### 8. Sin testing ni observabilidad
La lógica de dominio (predicción) es crítica, pura y testeable — no hay ni un test planeado. Falta crash reporting (Sentry) con scrubbing de PII: un log que filtre síntomas es un incidente de privacidad.

### 9. Boundaries de Clean Architecture no aterrizados
Regla de oro: Zustand vive en **presentación**; la BD vive en **data**; el dominio (entidades + casos de uso) es TS puro sin dependencias de RN. Si el store de Zustand acaba importando SQLite, la arquitectura murió.

---

## Gaps de Negocio y Monetización

### 1. Fill rate 0% en rewarded = usuaria bloqueada
El flujo "ver video → desbloquear" falla si no hay fill: la usuaria pulsa y no pasa nada. La regla debe ser **fail-open, nunca fail-closed**:
- Reintentos acotados + timeout; si AdMob no sirve en N intentos, **conceder la recompensa gratis** y registrar `reward_granted_fallback`.
- El estado "recompensa disponible" vive en la lógica local, no depende del SDK.
- Regla dura: **ninguna feature crítica de salud se bloquea por falta de anuncio.**

### 2. Gatear el "PDF para el ginecólogo" detrás de un anuncio
Riesgo ético y de store review: barrera publicitaria entre una mujer y su médico en contexto de salud. Mal visto por Apple (Health apps sensibles), posible rechazo. Recomendación: PDF médico **gratis** (o IAP barato); reservar rewarded para lo cosmético (temas/iconos) y "nice to have" (tendencias avanzadas).

### 3. Frequency capping de 48h sin mecanismo
El doc dice "máximo 1 intersticial cada 48h" pero no dónde se guarda el contador. Debe ser un timestamp en MMKV, controlado localmente, independiente de AdMob. Además, el trigger "justo después de guardar su periodo" es un momento íntimo/vulnerable: un fullscreen ad ahí daña la percepción de marca. Moverlo a transiciones menos sensibles.

### 4. No hay IAP ni "Remove Ads"
Solo rewarded ads plafona el ARPU y castiga a la usuaria que pagaría por quitar anuncios. Falta el stream estándar: IAP único de "quitar anuncios" y/o suscripción.

### 5. Analítica anónima: inexistente
No se puede optimizar lo que no se mide. Mínimo viable (agregado, sin datos de salud, tras consentimiento):
- **Funnel:** `onboarding_completed`, `first_period_logged`, retención D1/D7/D30.
- **Engagement:** ciclos registrados/mes, features premium tocadas.
- **Monetización:** `fill_rate`, `eCPM` por formato, `rewarded_started/completed/skipped`, `interstitial_shown` vs cap, `reward_granted_fallback`.
Definir tooling (Firebase sin PII / PostHog self-host / Amplitude) y su gating de consentimiento GDPR.

### 6. Viabilidad de AdMob en la categoría no verificada
Apps de menstruación/salud entran en políticas sensibles de AdMob. Confirmar que cuenta y unidades de anuncio cumplen, publicar `app-ads.txt` y hacer account linking. Si AdMob limita la categoría, el modelo de negocio entero cae: dependencia crítica sin plan B.

### 7. Persistencia y anti-abuso del unlock no definidas
¿El desbloqueo es permanente o por sesión? ¿Por cada PDF? Definir granularidad del grant, guardarla localmente y prevenir que reinstalar regenere recompensas (ligado al gap de cambio de dispositivo).

---

## Gaps UX/UI

Para que Martha no trabaje sobre arenas movedizas, falta diseñar ANTES de codear:

### 1. Empty states (ninguno definido)
- Primer arranque: calendario vacío, sin ciclos.
- "Aún no puedo predecir" (<2 ciclos): la pantalla central no tiene nada que mostrar — diseñar qué ve la usuaria en vez de un hueco o predicción falsa.
- Historial vacío, contenedor de anuncio vacío (sin fill: ¿colapsa el banner o reserva espacio? Causa saltos de layout si no se diseña).

### 2. Error states
- "Ver anuncio" → no carga (mensaje + botón "obtener gratis" fallback).
- Generación de PDF falla.
- Permiso de notificaciones denegado → pantalla de racionalización y re-permission (o ajuste profundo a Settings).
- Escritura en BD falla / almacenamiento lleno.

### 3. Loading states
Cold start, render del calendario, generación asíncrona del PDF, carga inicial. Sin skeletons, la app se siente rota.

### 4. Onboarding desglosado
Bajar "onboarding de confianza" a pantallas: orden de pedido de permisos (soft-ask de notificaciones + ATT + consentimiento UMP), flujo de primer registro (fecha de inicio, duración por defecto, largo de ciclo), ruta de "saltar", y la explicación de privacidad prometida.

### 5. Pre-prompt / soft-ask de permisos
Nunca lanzar el diálogo nativo de ATT o notificaciones en frío. Pantalla previa que explique el "por qué" — sube el opt-in.

### 6. Ciclos irregulares y casos vitales
El plan asume ciclos regulares. Faltan estados para: anticonceptivos hormonales, embarazo, posparto, perimenopausia, SOP/PCOS, ciclos muy irregulares. La predicción falla ahí y la UI debe degradar con gracia (no mostrar predicción errónea con confianza).

### 7. Edición / deshacer de registros
Equivocarse de día es común en logging de salud. No hay flujo de editar/borrar/deshacer. Es un must.

### 8. Accesibilidad
Contraste (rojo sobre fondos claros), daltonismo para fases del ciclo (periodo vs fértil vs ovulación no pueden depender solo del color), VoiceOver/TalkBack sobre el calendario (notoriamente difícil), Dynamic Type. Cero mención.

### 9. Eliminación de datos y privacidad (UX + compliance)
App Store exige "account/data deletion" visible aunque sea offline. Falta el flujo "borrar todos mis datos" y un mini dashboard de privacidad. Requisito de revisión.

### 10. Rewarded flow UX
Affordance clara: qué desbloquea, cuánto dura el video, y qué pasa si lo cierra a medias (vista parcial = sin recompensa, hay que comunicarlo).

### 11. i18n / dark mode
Terminología menstrual varía culturalmente; formatos de fecha locales; dark mode. No aparecen.

> Detalle menor del documento fuente: typo "persado" → "pensado" (línea 21).

</analisis_critico>

---

<plan_de_accion>

Tres pasos secuenciales y ejecutables para arrancar el setup con Expo y Zustand.

## Paso 1 — Scaffold del proyecto y fronteras de Clean Architecture
- `npx create-expo-app` con template TypeScript, New Architecture activada, strict mode.
- Estructura por capas: `src/domain` (entidades + casos de uso, TS puro, sin RN), `src/data` (repositorios, mappers, SQLite, MMKV), `src/presentation` (screens, componentes, stores Zustand). Regla: presentation → domain ← data.
- Deps base: `zustand`, `expo-sqlite`, `drizzle-orm`, `react-native-mmkv`, `expo-secure-store`, `@react-navigation`, alias de paths (`@/`), ESLint + Prettier + Husky.
- **Entregable:** `App.tsx` que arranca, un store Zustand trivial y la convención de capas documentada. Validar aquí compatibilidad de ads/PDF con la New Arch.

## Paso 2 — Capa de persistencia + migraciones + primer caso de uso testeado
- Schema Drizzle sobre `expo-sqlite` para `cycles`, `period_logs`, `symptoms`; runner de migraciones versionado en el bootstrap.
- MMKV + `persist` de Zustand para preferencias; `expo-secure-store` para la clave de cifrado at-rest.
- Patrón Repository + caso de uso punta a punta: `LogPeriodUseCase` → guardar → `CalculatePredictionUseCase` (módulo de fechas puro, UTC, determinista).
- **Entregable:** flujo "registrar periodo → calcular predicción" contra SQLite con **unit tests** de la predicción (incluido <2 ciclos = sin predicción).

## Paso 3 — Consentimiento, permisos y AdMob fail-open tras abstracción
- Cablear Google UMP (consent GDPR) + iOS ATT + soft-ask de notificaciones, en el orden correcto del onboarding.
- Envolver `react-native-google-mobile-ads` detrás de un `AdsService` (interfaz en domain, impl en data): frequency capping propio con timestamp en MMKV, reintentos con timeout y **concesión fallback si no hay fill** (fail-open).
- Abstracción de analítica privacy-safe (eventos, sin PII, tras consentimiento) y Sentry con scrubbing.
- **Entregable:** gate de anuncio que jamás bloquea aunque AdMob devuelva 0% de fill, con eventos de monetización instrumentados.

---

**Recomendación de negocio transversal antes del Paso 3:** sacar el **PDF médico del gate de rewarded** (gratis o IAP barato) y reservar rewarded para temas/iconos y tendencias. Es lo correcto ética y legalmente, y reduce riesgo de rechazo en store review.

**Decisiones abiertas a cerrar antes de ejecutar:**
1. SQLite (`expo-sqlite` + Drizzle) vs `op-sqlite`.
2. Tooling de analítica (Firebase sin PII / PostHog self-host / Amplitude).
3. Política de backup y cambio de dispositivo (export/import cifrado vs cloud vs nada).

</plan_de_accion>
