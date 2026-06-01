---
trigger: always_on
---

You should avoid using `any` whenever possible; inline types should not be used—instead, you should create a separate interface or type—and you should almost never use `any`.
If there is a case where using `any` is problematic, you can use `unknown` or another alternative, but only in specific situations. In most cases, you should use the correct type.
