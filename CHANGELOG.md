# **SimpleCMDs' Changelog**
All notable changes to this project will be documented in this file — the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

&nbsp;

## Unreleased Version

## v2.0.0 — TBD
### Note
- **A code-breaking release has happened**. Please refer to the `README.md` and Wiki to see the new syntax and tools.

&nbsp;

### Added
- `.set(options)` method — takes in an object and sets global program options (read wiki).
- Commands are now created in a single object via the `.commands` method (read wiki).
- `amount` (command option) functionality has been improved:
  - Command arguments over the allowed `amount` will now be discarded.
  - Ensures the `amount` allows for all required arguments in the `rules` string.
- Minified distribution file via WebPack.
  - Preserves exposed module's JSDocs.
  - Minified via Terser.
  - Babel for Node 8.0 compatibility.
- Test script to ensure functionality works as intended.
  - `npm test` shows a simplified version.
  - `npm run test:verbose` shows a verbose version.
  - Dash shell compliant
- Grouped short aliases can now have grouped arguments following them: `-abc one+two,three,four`.
  - This would be the same as typing `-a one two -b three -c four`.
- The help menu has been revamped:
  - Supports single command help pages (via command option `help`). Accessed via -h 'command'.
  - The main help page is accessible as normal.
- Default version command: `-v` or `--version`.
- Default debug command can be toggled on/off through program options.
- `CHANGELOG.md` for better documentation.
- GitHub Wiki documentation.

&nbsp;

### Updated
- Callbacks are now:
  - passed an object containing args, validity, and the other commands values.
  - run in the order that the commands are issued.
- Revised various JSDoc comments.
  - Added example outputs.
  - Updated descriptions.
  - Updated various @return statements.
  - Updated @param types.
- `examples/calculator.js` has been updated to utilize these changes.
- The codebase is now split up into different modules (loc: `src/util/*`).
- Revised `README.md` to better reflect the new update:
  - `README.md` goes over the process of creating an interface (`createProfile.js`).
  - The code can be found in `examples/createProfile.js`.
  
&nbsp;

### Removed
- Various methods that were no longer in use.