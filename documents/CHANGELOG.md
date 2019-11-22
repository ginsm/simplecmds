# **SimpleCMDs' Changelog**
All notable changes to this project will be documented in this file — the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

&nbsp;

## Unreleased Version

## v2.0.0 — TBD
### Note:
- **A major code-breaking change has happened**. Please refer to the `README.md` to see the new syntax and tools.

This change has happened for several reasons:
- The command names will be declarative.
- The properties of the command will be declarative.
- There will be less iteration involved in the program.

&nbsp;

### Added:
- Commands are now created in a single object via the `.commands` method.
- Callbacks are now passed the commands object as a third argument.
- `.set(options)` method — takes in an object and sets global program options:
  - Program `version`.
  - Program `description`.
  - Enabling `debug` command.
  - `defaultRule` (applies to all commands).
- `.help` now has an `exit` parameter; if true the process will exit.
- `CHANGELOG.md` for better documentation.

&nbsp;

### Updated
- Command arguments over the amount limit will be ignored now.
- Revised various JSDoc comments.
  - Added example usage and outputs.
  - Updated descriptions.
  - Updated various return statements.
- `parseFlags` method -> `generateAlias`.
- `flagConflict` method -> `aliasConflict`.
- `examples/calculator.js` has been updated to utilize these changes.
  
&nbsp;

### Removed:
- `.setVersion` method.
- `.description` method.
- `.command` method.
- `.rule` method.
- `lastBuiltCommand` method.
- `.camelCase` method.