# Plan de Producto y Monetización: Tracker de Ciclo Menstrual

**Objetivo del Documento:** Consolidar la estrategia de UX/UI, arquitectura técnica y monetización de la aplicación para permitir que un agente de IA (como OpenCode) analice la estructura e identifique brechas, casos límite o requisitos faltantes (gaps).

---

## 1. Estrategia de Experiencia de Usuario (UX/UI)

La interfaz prioriza la empatía, la privacidad y una experiencia con fricción cero.

- **Onboarding de Confianza:** Un flujo inicial que explique claramente cómo se protegen los datos de salud de la usuaria antes de pedir el primer registro del ciclo.
- **Jerarquía Visual:** El calendario y la predicción del ciclo son el centro de la aplicación.
- **Integración Publicitaria Nativa:** Diseño de espacios publicitarios específicos (ej. banners al final del scroll o separadores entre artículos informativos de salud) para que los anuncios se perciban como parte de la interfaz sin romper la estética general.

---

## 2. Arquitectura y Desarrollo

El proyecto se desarrollará aplicando principios de **Clean Architecture** (Dominio, Casos de Uso, Presentación).

- **Stack Técnico persado:**
  - React Native Expo (aprovechando la Nueva Arquitectura con Fabric y TurboModules para animaciones fluidas, especialmente en el calendario).
  - Zustand para el manejo del estado global (eliminando el boilerplate asociado a Redux).
  - Almacenamiento local (Offline-first) para garantizar la privacidad de los datos.
- **Flujo con IA:** Utilización de OpenCode como agente de terminal. Se emplearán prompts meta-estructurados con etiquetas XML para instruir a OpenCode en la generación de la arquitectura base, adaptadores de base de datos local y configuración del SDK de anuncios.

---

## 3. Estrategia de Monetización por Publicidad

La estrategia cumple con las estrictas políticas de privacidad para apps de salud en iOS (App Store) y Android (Google Play), asegurando que **no** se compartan datos de salud para la segmentación de anuncios.

- **Red Publicitaria:** Google AdMob (mediante la librería `react-native-google-mobile-ads`, 100% compatible con Expo).

### 3.1 Formatos Publicitarios Implementados

#### A. Banners Fijos (Baja Intrusión)

- **Ubicación:** En la parte inferior de pantallas secundarias como "Ajustes" o la vista de "Historial".
- **Restricción:** Nunca deben tapar el calendario principal ni ubicarse cerca de los botones de registro de síntomas para evitar clics accidentales.

#### B. Intersticiales (Alta Conversión, Uso Estratégico)

- **Ubicación:** Pantalla completa.
- **Trigger (Desencadenador):** Solo se muestra después de una acción de cierre o éxito (ej. inmediatamente después de que la usuaria guarda su registro del periodo del mes y recibe su predicción, justo antes de volver a la pantalla principal).
- **Control de Frecuencia (Frequency Capping):** Límite estricto de máximo 1 anuncio cada 48 horas.

#### C. Anuncios Recompensados (Rewarded Ads) para "Micro-Features"

En lugar de utilizar un modelo de suscripción rígido (muro de pago), se permite a las usuarias ver un video publicitario de 30 segundos para desbloquear funciones puntuales y premium:

1. **Exportar Reporte en PDF:** Generación de un resumen estructurado del historial (últimos 3 meses) diseñado para ser mostrado al ginecólogo.
2. **Paquetes de Iconos y Temas:** Opciones de personalización estética adicional para la interfaz.
3. **Análisis Avanzado de Tendencias:** Acceso a reportes que correlacionan estados de ánimo, síntomas y días del ciclo.
