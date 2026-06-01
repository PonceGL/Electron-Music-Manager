---
trigger: always_on
---

Components with `function`. Always declare components using the reserved keyword `function`. Reserve arrow functions exclusively for helper functions, event handlers, or internal component logic.

Named Exports. The use of `export default` is prohibited. All components must use `export function ComponentName...`. This ensures consistency in autocompletion, facilitates refactoring, and ensures that the name remains consistent throughout the project.

Agnostic (Presentational) Components. Prioritize creating small, stateless components without business logic. They should receive data via props and emit events. Heavy logic should reside in hooks or higher-order components.

Early Returns (Guard Clauses). Avoid complex ternary operators or short-circuit logic (&&) within the main JSX. If a component should not be rendered or is in a loading state, use `if (...) return null;` or `return <Loader />;` at the beginning of the function.

Composition and Prop Drilling. Instead of passing props through five levels, use the `children` prop or composition patterns like React Portals. If the component is a “container,” it should allow the consumer to inject content.

Logic Placement. Logic that belongs solely to that component should reside in a custom hook. The component file should be clean and focused on the UI structure.

Strict Prop Typing. Each component must have its own TypeScript interface (e.g., interface ComponentProps). Avoid using React.FC or React.FunctionalComponent to allow full control over the typing of children and generics.

Use PropsWithChildren if a component receives children. import type { PropsWithChildren } from "react";
