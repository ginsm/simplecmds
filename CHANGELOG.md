# **SimpleCMDs' Changelog**
All notable changes to this project will be documented in this file — the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

&nbsp;

## Unreleased Version

## v2.0.0 — TBD
### Note
- **A code-breaking release has happened**. Please refer to the `README.md` to see the new syntax and tools.

&nbsp;

### Added
- `.set(options)` method — takes in an object and sets global program options (read wiki).
- Commands are now created in a single object via the `.commands` method.
- `amount` (command option) functionality has been improved:
  - Command arguments over the allowed `amount` will now be discarded.
  - Ensures the `amount` allows for all required arguments in the `rules` string.
- Default version command: `-v` or `--version`.
- Callbacks are now passed the built commands object as a third argument.
- Minified distribution file via WebPack.
- Test script to ensure functionality works as intended.
- Grouped short aliases can now have grouped arguments following them: `-abc one+two,three,four`.
  - This would be the same as typing `-a one two -b three -c four`.
- `.showHelp` now has an `exit` parameter; if true the process will exit.
- `CHANGELOG.md` for better documentation.
- GitHub Wiki documentation.

&nbsp;

### Updated
- Revised various JSDoc comments.
  - Added example outputs.
  - Updated descriptions.
  - Updated various @return statements.
  - Updated @param types.
- `examples/calculator.js` has been updated to utilize these changes.
- `.help` method has been renamed to `.showHelp`.
- The codebase is now split up into different modules.
- Revised `README.md` to better reflect the new update:
  - `README.md` goes over the process of creating a tiny interface (`print.js`).
  - The code can be found in `examples/print.js`.
  
&nbsp;

### Removed
- `.setVersion` method.
- `.description` method.
- `.command` method.
- `.rule` method.
- `lastBuiltCommand` method.
- `.camelCase` method.