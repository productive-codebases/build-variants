# Changelog

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
