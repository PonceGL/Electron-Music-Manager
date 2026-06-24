import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  // Ignored paths
  {
    ignores: ['out/**', 'dist/**', 'node_modules/**']
  },

  // Base TypeScript rules for all source files
  ...tseslint.configs.recommended,

  // Main process + Preload (Node.js environment)
  {
    files: ['src/main/**/*.ts', 'src/preload/**/*.ts', 'electron.vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      // Process boundary: main/preload never reach into the renderer's code.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)renderer(/|$)',
              message:
                'main/preload no pueden importar de src/renderer — el preload solo expone una API, nunca consume código del renderer.'
            }
          ]
        }
      ]
    }
  },

  // Renderer (browser + React)
  {
    ...reactPlugin.configs.flat.recommended,
    files: ['src/renderer/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      // Process boundary: the renderer only ever talks to main/preload through
      // window.electronAPI — it never touches Electron/Node or their source directly.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'electron',
              message:
                'El renderer no puede importar "electron" directamente — usa window.electronAPI expuesto por el preload.'
            }
          ],
          patterns: [
            {
              regex: '^node:',
              message: 'El renderer no puede importar módulos nativos de Node.js.'
            },
            {
              regex: '(^|/)main(/|$)',
              message:
                'El renderer no puede importar de src/main — usa window.electronAPI expuesto por el preload.'
            },
            {
              regex: '(^|/)preload(/|$)',
              message:
                'El renderer solo puede importar tipos de src/preload (import type) para derivar ElectronAPI — las llamadas en tiempo de ejecución van por window.electronAPI.',
              allowTypeImports: true
            }
          ]
        }
      ]
    }
  },

  // Test files — add Vitest globals
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly'
      }
    }
  },

  // Disable ESLint rules that conflict with Prettier (always last)
  prettierConfig
)
