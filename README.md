# SimpleCMDs
This module allows you to easily create command line interfaces for your projects.

### Features
- :wrench: Creation of custom commands.
- :abc: Concatenated short aliases (`'-csa 1,2,3 4'` -> `'-c 1 -s 2 -a 3 4'`).
- :speech_balloon: Variadic (unlimited) arguments per command.
- :guardsman: Argument types and amount checking.
- :information_desk_person: Dynamic, customizable help menu.
- :link: Command chaining.

&nbsp;

##   Table of contents: <!-- omit in toc -->

- [SimpleCMDs](#simplecmds)
    - [Features](#features)
  - [Installing](#installing)
  - [Importing](#importing)

&nbsp;

## Installing

```
npm i simplecmds
```

## Importing

```javascript
const cmds = require('simplecmds');
```
