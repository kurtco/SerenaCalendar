# Design System Integration — Serena

**Estado**: Ratificado · **Fecha**: 2026-09-12 · **Repos**: [`kurtco/SerenaCalendar`](https://github.com/kurtco/SerenaCalendar) (app) + [`kurtco/Serena-Calendar-Desing-System`](https://github.com/kurtco/Serena-Calendar-Desing-System) (design system)

## Decisión

Dos repositorios independientes unidos por un **submódulo Git** montado en `packages/ui-native`, consumido de forma transparente vía **workspaces** (sin alias manuales). Contextos de IA aislados: Martha = Claude en su repo; John = OpenCode + SpecKit en el repo de la app.

## Repos y ownership

- **`Serena-Calendar-Desing-System`** (Martha): fuente de verdad de componentes React Native nativos + tokens. "Publicar" = `git push`/tag a la rama trackeada. Tras el scaffold inicial de John, **solo Martha commitea componentes**.
- **`SerenaCalendar`** (John): app + backend + artefactos SDD. John posee todo aquí.

## Modelo de consumo

- Submódulo montado en el root del monorepo: `packages/ui-native`.
- Root `package.json` → `workspaces: ["mobile", "packages/*"]`.
- Paquete con `name: "@repo/ui-native"` y `main: "src/index.ts"` (**fuente, sin build step**). Workspaces lo simlinkea a `node_modules`; se importa por su nombre real: `import { Button } from '@repo/ui-native'` — **sin configuración de alias**.
- **Metro**: `watchFolders` incluye `packages/ui-native` para que Expo transpile la fuente TS simlinkeada (la ruta real queda fuera de `node_modules`) y haga hot-reload.
- **Sync**: Martha pushea → John ejecuta `git submodule update --remote`; el symlink ya apunta al directorio, así que los archivos nuevos aparecen sin re-enlazar. Pinear por **SHA/tag** para builds reproducibles; `--remote` es conveniencia de dev.

## Styling y dependencias

- **StyleSheet / estilos TS propios** (NO NativeWind) → sin `tailwind.config` ni `withNativeWind`.
- `peerDependencies` de `react`/`react-native` alineados al SDK Expo de la app (los fija John en el scaffold) → sin desalineación de versiones.

## Boundaries (Clean Architecture)

- El design system es **tonto/presentacional**: props primitivas + eventos; **nunca** importa entidades de dominio ni persistencia.
- Regla de lint en la app: `src/data/**` y `src/domain/**` **NO** pueden importar `@repo/ui-native`; solo `src/presentation/**`.
- **Tokens single-source** en el design system (`src/tokens.ts`); la app deriva su theme RN desde ellos en build (nunca copiar a mano).

## Responsabilidades de setup

- **John**: scaffold one-time del repo de diseño (`package.json`, `src/`, tokens, tsconfig, `.gitignore`, README, componente seed) + tag `v0.1.0`; todo el wiring de la app; CI.
- **Martha**: solo componentes + push.

## CI / integración

- Todo workflow de CI de la app: `git submodule update --init --recursive`.
- Smoke build que importe un componente del design system.
- Jest resuelve `@repo/ui-native` (symlink de workspace / `moduleNameMapper` fallback).

## Ritual de update

- Dev: `git submodule update --remote`.
- Release: pin SHA/tag; bump deliberado; Renovate opcional después.
- Migrar a paquete versionado (git-tag / npm privado) si el submodule da fricción al estabilizarse.

## Fuera de alcance (fase 2)

- Storybook RN host en el repo de diseño.
- NativeWind.
- Publicación a registry npm.
