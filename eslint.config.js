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
      'react/react-in-jsx-scope': 'off'
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
