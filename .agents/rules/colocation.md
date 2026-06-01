---
trigger: always_on
---

Role: Expert React Native & Expo Developer.
Architecture Rule: Strict Colocation & Expo Router Structure

Project Root: All source code must reside in the src/ directory.

Routing (Expo Router):

All routes must be in src/app/.

Keep route files "thin". They should only handle navigation logic, params, and layout.

If a route needs unit testing, create a **tests** folder inside the specific route directory to prevent Expo Router from indexing the test files as routes.

Component Structure (Colocation Pattern):

For every new component (in src/components/, src/features/, or src/screens/), create a dedicated folder named after the component.

Inside the folder, always generate:

index.tsx: The main component logic (default export).

styles.ts: Styled-components or StyleSheet definitions.

[ComponentName].test.tsx: Unit tests using React Native Testing Library.

Naming Conventions:

Folders: PascalCase (e.g., UserCard).

Styles: Always named styles.ts.

Tests: [ComponentName].test.tsx.

Avoid Barrel Files in app/: Do not use index.tsx folders inside src/app/ unless it is strictly necessary for the root of a path. Prefer named files like profile.tsx to avoid tab confusion in the IDE.

Example of Final Structure:

```
/src
 ├── app/                      # Solo Definición de Rutas
 │   ├── _layout.tsx
 │   ├── index.tsx             # Home Route
 │   └── profile/
 │       ├── __tests__/        # Tests de la ruta (params, etc)
 │       │   └── profile.test.tsx
 │       └── index.tsx         # /profile Route
 ├── components/               # Componentes Reutilizables
 │   └── CustomButton/
 │       ├── index.tsx         # Lógica
 │       ├── styles.ts         # Estilos
 │       └── CustomButton.test.tsx
 └── hooks/
     └── useAuth/
         ├── index.ts
         └── useAuth.test.ts
```
