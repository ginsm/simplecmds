# **SimpleCMDs' Changelog**
All notable changes to this project will be documented in this file — the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

&nbsp;

## Unreleased Version

## v2.0.0 — TBD
### Note
- **A code-breaking release has happened**. Please refer to the `README.md` to see the new syntax and tools.

&nbsp;

### Added
- Commands are now created in a single object via the `.commands` method.
- Callbacks are now passed the commands object as a third argument.
- `.set(options)` method — takes in an object and sets global program options:
  - Program `version`.
  - Program `description`.
  - Enabling `debug` command.
  - `defaultRule` (applies to all commands).
- Grouped short aliases can now have grouped arguments following them: `-abc one,two,three`.
  - This would be the same as typing `-a one -b two -c three`.
- `.help` now has an `exit` parameter; if true the process will exit.
- `CHANGELOG.md` for better documentation.
- Distribution file that is minified and transpiled via Babel.

&nbsp;

### Updated
- Command arguments over the allowed `amount` will now be discarded.
  - Prevents extra arguments from invalidating the command.
- Revised various JSDoc comments.
  - Added example outputs.
  - Updated descriptions.
  - Updated various @return statements.
  - Updated @param types.
- The codebase is now split up into several files.
- `examples/calculator.js` has been updated to utilize these changes.
  
&nbsp;

### Removed
- `.setVersion` method.
- `.description` method.
- `.command` method.
- `.rule` method.
- `lastBuiltCommand` method.
- `.camelCase` method.