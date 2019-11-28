# SimpleCMDs <!-- omit in toc -->
SimpleCMDs is a zero-dependency module designed to help you easily create custom command line interfaces.

### Features
- :pencil2: Create custom commands.
- :link: Easily chain commands.
- :speech_balloon: Multiple arguments per command.
- :guardsman: Argument type and amount enforcing (validation).
- :abc: Concatenated short aliases support.
- :question: Dynamic, customizable help menu.

&nbsp;

##   Table of contents: <!-- omit in toc -->

- [Install and Import](#install-and-import)
  - [Installing](#installing)
  - [Importing](#importing)
- [Creating a basic interface](#creating-a-basic-interface)
  - [Boilerplate](#boilerplate)
  - [Program Options](#program-options)
  - [Commands](#commands)
  - [Callback Function](#callback-function)
  - [Full Code](#full-code)
- [Final Note](#final-note)

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
I believe the best way to learn a technology is to create something with it. In this section I will create a simple interface utilizing all of the features of this package. There will be links that go into more detail at the top of each section for you to reference as we go.

&nbsp;

**The Project (print.js):**

There will be three commands: `message`, `subject`, and `body`. Running `node print -m -s 'My subject' -b 'My body text'` will print the message to the terminal as such:

```bash
~: node print -ms 'My Subject' -b 'My body text'
Subject: My subject
Body: My body text
```

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
[[ options wiki page ]](https://github.com/ginsm/simplecmds/wiki/Program-Options)

```javascript
const options = {
  description: 'Print a message with a subject and body.',
  defaultRule: {
    rule: '<string,number>',
    amount: 1,
  }
};
```

**Explanation**

I excluded the `version` and `debug` options in order to use their default values. The program description will be used when printing the help menu (`<program> -h`). The defaultRule does two things: 
1. Require the first argument to be a 'string' or 'number'.
2. Allow no more than 1 argument.

In order to understand the `defaultRule` better I recommend reading the [ rules ](https://github.com/ginsm/simplecmds/wiki/Command-Creation#rule) wiki page.

&nbsp;

### Commands

[[ commands wiki page ]](https://github.com/ginsm/simplecmds/wiki/Command-Creation)

Commands are created as such: `[command]: {...commandOptions}`.

```javascript
const commands = {
  message: {
    usage: '-m --message *subject *body',
    description: 'Write a message; requires -s and -b',
    callback: print,
    rule: false, // negate defaultRule
  },

  // The default rule will be added to the next two commands
  subject: {
    usage: '-s --subject <subject>',
    description: 'Set the subject text',
  },
  body: {
    usage: '-b --body <bodyText>',
    description: 'Set the body text',
  }
};
```

**Explanation**

Great! Our three commands are set up. The first command negates the `defaultRule` (via `rule: false`) and uses a function called `print` as it's callback. The following two are simple setter commands that will be consumed in `print`.

&nbsp;

### Callback Function

[[ callback wiki page ]](https://github.com/ginsm/simplecmds/wiki/Command-Creation#callback-function)

Our callback receives three arguments: `args`, `valid`, and `commands`. The commands object contains the arguments and validity of every command ran. This makes it very easy to chain commands. In this case, I will destructure the commands object to grab the subject and body commands directly. I won't be using `args` or `valid` of the message command itself.

```javascript
function print(args, valid, {subject, body}) {
  // Ensure that both commands are valid
  const bothValid = (subject.valid && body.valid) || simplecmds.showHelp(true);

  if (bothValid) {
    // add a limit of 60 characters
    const subjectText = subject.args[0].slice(0, 60);
    const bodyText = body.args[0];
    console.log(`Subject: ${subjectText}\n\nBody: ${bodyText}`);
  }
}
```

**Explanation**

Our print function will first check the validity of our `subject` and `body` commands. From there, it will grab both the subject and the body text; ensuring that the subject is no longer than 60 characters. Finally, it will print the message to the terminal.

&nbsp;

### Full Code

```javascript
const simplecmds = require('simplecmds');

const options = {
  description: 'Print a message with a subject and body.',
  defaultRule: {
    rule: '<string,number>',
    amount: 1,
  }
};
const commands = {
  message: {
    usage: '-m --message *subject *body',
    description: 'Write a message; requires -s and -b',
    callback: print,
    rule: false, // negate defaultRule
  },

  // The default rule will be added to the next two commands
  subject: {
    usage: '-s --subject <subject>',
    description: 'Set the subject text',
  },
  body: {
    usage: '-b --body <bodyText>',
    description: 'Set the body text',
  }
};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);


// callback
function print(args, valid, {subject, body}) {
  // Ensure that both commands are valid
  const bothValid = (subject.valid && body.valid) || simplecmds.showHelp(true);

  if (bothValid) {
    // add a limit of 60 characters
    const subjectText = subject.args[0].slice(0, 60);
    const bodyText = body.args[0];
    console.log(`Subject: ${subjectText}\nBody: ${bodyText}`);
  }
}
```

&nbsp;

## Final Note

While there could be improvements to the simple interface we created I hope it has helped you gain a better understanding of this package. If you have any other questions please read the wiki or post an issue and I'll be happy to help. Feature requests are welcomed as well! 

Links: &nbsp; [[ Wiki ]](https://github.com/ginsm/simplecmds/wiki) &nbsp; [[ Issue Tracker ]](https://github.com/ginsm/simplecmds/issues) &nbsp; [[ NPM ]](https://www.npmjs.com/package/simplecmds)
