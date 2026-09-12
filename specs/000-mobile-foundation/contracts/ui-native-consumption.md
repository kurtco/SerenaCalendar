# Contract: `@repo/ui-native` consumption

**Feature**: 000-mobile-foundation · **Date**: 2026-09-12

## Import surface

```ts
import { SerenaButton, tokens } from '@repo/ui-native';
```

- Resolved via root workspaces symlink (`packages/ui-native`), **no alias config**.
- Source-consumed (`main: src/index.ts`); Expo/Metro transpiles it (`watchFolders` includes the submodule).

## Boundary rules (enforced by lint)

- `mobile/src/presentation/**` MAY import `@repo/ui-native`.
- `mobile/src/data/**` and `mobile/src/domain/**` MUST NOT import `@repo/ui-native`.
- The design system MUST remain presentational (props primitives + events); it never imports app domain/persistence.

## Theming

- App theme (`presentation/theme/`) is **derived** from `tokens` at build/startup; no hand-copied values.

## Versioning

- Submodule pinned by SHA/tag (currently `v0.1.0`). Bump deliberately; CI runs `submodule update --init --recursive`.
