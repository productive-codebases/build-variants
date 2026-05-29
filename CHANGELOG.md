# Changelog

## v1.6.0 (2026-05-30)

### Changed

- Update the development toolchain to current package versions, including Vitest 4, TypeScript 6, and Biome 2.
- Reshape the README into a shorter API-first guide while keeping coverage of the full builder surface.
- Improve published package metadata with `exports`, `files`, `sideEffects`, and a Node 18+ engine declaration.

### Fixed

- Fix `if(() => false, rawObject)` so predicate functions correctly control raw style blocks.
- Fix merge ordering so explicit `weight` precedence wins before private variant tie-breaking.

## v1.5.3 (2024-03-10)

### Changed

- Update dependencies.
- Use `@emotion` instead of `styled-components` that is more versatile to be used with build-variants.
- Fix minor typos.

## v1.5.2 (2024-03-10)

### Changed

- Improve README.

## v1.5.1 (2024-03-13)

### Fixed

- Fix styles application when using raw styles in a `if` block.

## v1.5.0 (2024-03-09)

### Added

- Accept styles directly as the second argument on conditions.

## v1.4.0 (2023-07-24)

### Added

- Update all npm dependencies, including styled-components v6 for testing.
- Export `CSSObject` (equivalent of styled-components v5's one)

## v1.3.0 (2023-01-04)

### Added

- Predicate on the `debug()` function allowing to limit debugging for specific use-cases.

### Updated

- Rewrite all the README with step-by-step explanations and Codesandboxes examples.

## v1.2.0 (2022-11-14)

### Changed

- Prop values passed to `variant(s)` and `compoundVariant(s)` are now optional.
  It allows to not apply default styles or having to create "empty variant" for default cases.

- Private variants (prop starting by `_`) now overrides composed variants got from an existing variant declaration.

  For example, let's consider a Button on which the "primary" variant define a white color, if a private variant is defining a different color, it's possible to override the primary color like this:

```tsx
<Button variant="primary" _color="red" />
```

## v1.1.0 (2022-10-11)

### Added

- Add the possibility to compose styles with a local builder instance for css blocks (#8)
- Implement CSS replacements (#7)

## v1.0.0 (2022-07-05)

- Initial release.
