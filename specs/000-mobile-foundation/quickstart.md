# Quickstart: Mobile Foundation

**Feature**: 000-mobile-foundation · **Date**: 2026-09-12

## Prereqs

- Node 20+, `npm` (workspaces), Xcode (iOS) / Android Studio (Android), EAS CLI (`npm i -g eas-cli`), Expo account.

## Clone (with submodule)

```bash
git clone --recurse-submodules https://github.com/kurtco/SerenaCalendar.git
cd SerenaCalendar
# if cloned without --recurse-submodules:
git submodule update --init --recursive
```

## Install

```bash
npm install            # root workspaces: mobile + packages/ui-native
```

## Run

```bash
cd mobile
npx expo start         # dev client (EAS dev build) on device/simulator
# or a packaged dev build:
eas build --profile development --platform ios|android
```

## Verify design-system consumption

```bash
cd mobile && npm test -- src/presentation   # renders a screen importing @repo/ui-native
```

A seed screen imports `SerenaButton` + `tokens` from `@repo/ui-native`; confirm render + hot-reload after `git submodule update --remote`.

## Test / lint

```bash
cd mobile && npm test && npm run lint && npx tsc --noEmit
```

## Update design system

```bash
git submodule update --remote packages/ui-native   # dev
# release: pin SHA/tag then commit the gitlink
```
