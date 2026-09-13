const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/',
      'ios/',
      'android/',
      '.expo/',
      'dist/',
      'web-build/',
      'expo-env.d.ts',
      '*.config.js',
      '*.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  // Clean Architecture boundary: domain must remain pure.
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/ui-native',
              message:
                'Domain must not import the design system (presentation-only).',
            },
          ],
          patterns: [
            {
              group: [
                '../data/**',
                '../presentation/**',
                'react-native',
                'expo-*',
              ],
              message: 'Domain must be pure TypeScript with no RN/DB/UI deps.',
            },
          ],
        },
      ],
    },
  },
  // Clean Architecture boundary: data must not import UI.
  {
    files: ['src/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/ui-native',
              message:
                'Data layer must not import the design system (presentation-only).',
            },
          ],
          patterns: [
            {
              group: ['../presentation/**', '@repo/ui-native'],
              message: 'Data layer must not depend on presentation.',
            },
          ],
        },
      ],
    },
  },
  // Presentation must go through domain use cases, not import data directly.
  {
    files: ['src/presentation/**/*.ts', 'src/presentation/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../data/**', '@/data/**'],
              message:
                'Presentation must access persistence through domain use cases.',
            },
          ],
        },
      ],
    },
  }
);
