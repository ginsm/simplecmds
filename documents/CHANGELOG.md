# **Task's Changelog**
All notable changes to this project will be documented in this file — the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

&nbsp;

## Unreleased Version

---

## v2.0.0 — TBD
### Note:
- **A major change has happened**. Please refer to the `README.md` to see the new syntax and tools.

This change has happened for several reasons:
- The command names will be set by the user (thus predictable).
- There will be less iteration involved in the program.
- The properties of the command will be more declarative.

&nbsp;

### Added:
- Major change: Commands are now created as one object.
- `.set(options)` method. Takes in an object and sets global program options.
- Disable debug command — this can be set in `.set` using `{ debug: false }`.
- Default rule — this can be set in `.set` using `{ defaultRule: { rule: '<number>', amount: 0 } }`.
- version and description are handled by `.set` using `{ version: 'v1.0.0', description: 'Description' }`.
- `.help` now has a `exit` parameter; if true then `process.exit` will be invoked.
- `CHANGELOG.md` for better documentation.

&nbsp;

### Changed
- `parseFlags` method -> `generateAlias`.
- `flagConflict` method -> `aliasConflict`.
- Example `calculator.js` has been updated to reflect these changes.
  
&nbsp;

### Removed:
- `.setVersion` method.
- `.description` method.
- `.command` method.
- `.rule` method.
- `lastBuiltCommand` method.
- `.camelCase` method.