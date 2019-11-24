# SimpleCMDs <!-- omit in toc -->
This module allows you to easily create command line interfaces for your projects.

### Features
- :wrench: Creation of custom commands.
- :abc: Concatenated short aliases (`'-csa 1,2,3 4'` -> `'-c 1 -s 2 -a 3 4'`).
- :speech_balloon: Variadic (unlimited) arguments per command.
- :guardsman: Argument types and amount checking (validation).
- :information_desk_person: Dynamic, customizable help menu.
- :link: Command chaining.

&nbsp;

##   Table of contents: <!-- omit in toc -->

- [Install and Import](#install-and-import)
  - [Installing](#installing)
  - [Importing](#importing)
- [Creating a basic interface](#creating-a-basic-interface)
  - [Boilerplate](#boilerplate)
  - [Program Options](#program-options)

&nbsp;

## Install and Import

### Installing
```
npm i simplecmds
```

### Importing
```javascript
const cmds = require('simplecmds');
```

&nbsp;

## Creating a basic interface
I believe the best way to learn a technology is to create something with it. In this section, I will create a basic interface utilizing all of the features of this package.

&nbsp;

### Boilerplate
```javascript
const simplecmds = require('simplecmds');

const options = {};
const commands = {};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);
```

&nbsp;

### Program Options
[[options wiki page]]()

```javascript
const simplecmds = require('simplecmds');

const options = {
  description: 'Print a message with a subject and body.',
  defaultRule: {
    rule: '<string>',
    amount: 1,
  }
};

const commands = {};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);
```

**What does this do?**
- I excluded the `version` and `debug` options in order to use their default values. 
- The program description will be used when printing the help menu.
- The defaultRule does two things:
  - Require the first argument of the commands to be a 'string'.
  - Allow no more than 1 argument for the command.