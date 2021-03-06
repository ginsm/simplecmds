# **SimpleCMDs' Changelog**
All notable changes to this project will be documented in this file — the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

&nbsp;

## Released Versions


## 2.1.1 - 12/31/2019

### Fixed
- The changelog had an issue. Oof.

&nbsp;

## v2.1.0 - 12/31/2019

### Added
- New `onNoCommand` program option 
  - Expects a function that will run when no commands are issued.
  - Defaults to outputting the help menu.
- The `help` method can now be accessed via `this.help` in callback functions.
- The library now ensures that each command has an usage string (required) and alerts the user.

### Fixed
- Naming a command `key` would result in unexpected behavior; this is no longer the case.
- Commands with no `help` or `description` property have a default help page now.

### Removed
- Zombie code from `simplecmds.js`.

&nbsp;


## v2.0.5 - 12/25/2019

### Disabled
- Concatenation — needs to be heavily reworked/revised.
- Disabled the concatenation tests in `test/script.sh`.

&nbsp;

## v2.0.4 - 12/24/2019 (Bug Fixes)

### Added
- The test script now contains 4 additional tests.

### Fixed
- A rule containing only an optional's validity is now true given no arguments.
- An argument of '0' is now properly converted to the number 0.

&nbsp;


## v2.0.1 — 12/18/2019
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