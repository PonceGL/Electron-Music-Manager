---
trigger: always_on
---

S - Single Responsibility Principle (SRP): Each component, hook, class or function should have a single reason to change.
Application: Separate business logic (data retrieval) into a custom hook and the UI into a functional component.
O - Open/Closed Principle (OCP): Components should be open for extension but closed for modification.
Application: Use compound components or pass components as children instead of creating multiple variants of a component.
L - Liskov Substitution Principle (LSP): Child components must be able to substitute for their parents without breaking the application.
Application: Ensure that if a Button component inherits props, the new version continues to function exactly like the original.
I - Interface Segregation Principle (ISP): Components should not depend on props they do not use.
Application: Avoid passing large objects as props; instead, pass only the specific data needed.
D - Dependency Inversion Principle (DIP): Depend on abstractions, not on concrete components.
Application: Use dependency injection via the Context API or pass components as props to decouple child components from their parents.
