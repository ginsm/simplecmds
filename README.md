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

**The Project (`HTTP2-server.js`):**

In this project, we will be creating a pseudo profile creator for HTTP2 servers. It will have four commands:
- `save`: '-s --save' — Save the profile.
- `key`: '-k --key' — Set the private key path.
- `cert`: '-c --cert' — Set the certificate path.
- `port`: '-p --port' — Set the port number.

```bash
~: node HTTP2-server -s 'profileName' -k './path/to/key' -c './path/to/cert' -p 443
HTTP2-server: 'profileName' created!
```

We will be making use of Node's `fs` module so be sure to require it at the top of the file:
```javascript
const fs = require('fs');
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
[[ program options ]](https://github.com/ginsm/simplecmds/wiki#program-options)

```javascript
const options = {
  description: 'Save HTTP2 server profiles.',
  defaults: {
    rules: '<string>',
    amount: 1,
  }
};
```

**Explanation**

I excluded the `version` and `debug` options in order to use their default values. The program description will be used when printing the help menu (`node createProfile -h`). In order to understand the [defaults](https://github.com/ginsm/simplecmds/wiki/defaults) property better I recommend reading about the [command options](https://github.com/ginsm/simplecmds/wiki#command-options).

&nbsp;

### Commands

[[ command options ]](https://github.com/ginsm/simplecmds/wiki#command-options)

```javascript
// this string will be used for the 'save' command's help page.
const saveHelp = 'This command lets you create a configuration profile for your server.\n\n\
You must provide a key and certificate in order to create a profile.\n\
You can issue them by running the following commands:\n\n\
  -k --key     Set the private key path\n\
  -c --cert    Set the certificate path\n\n\
You can provide an optional port to change it from the default (443):\n\n\
  -p --port    Set the port number'


// each one of these inherits 'amount' from program option's 'defaults' property.
const commands = {
  save: {
    usage: '-s --save <profile>',
    description: 'Create a new profile',
    callback: saveProfile,
    rules: '<number,string>',
    help: saveHelp,
  },
  key: {
    usage: '-k --key <path>',
    description: 'Set the private key path',
  },
  cert: {
    usage: '-c --cert <path>',
    description: 'Set the certificate path',
  },
  port: {
    usage: '-p --port <number>',
    description: 'Set the port number',
    rules: '<number>',
  }
};
```

**Explanation**

All of the commands will inherit `amount: 1` from `defaults`.

- save: I provided a callback function, replaced the default `rules` with my own, and created a help page for it.
- key: A basic command. It inherits `rules` from `defaults`.
- cert: A basic command. It inherits the `defaults` option's `rules`.
- port: A basic command. Its `rules` property ensures only a number is given to it.


&nbsp;

### Callback Function

[[ callback wiki page ]](https://github.com/ginsm/simplecmds/wiki/callback)

```javascript
function saveProfile({args: [name], valid, commands: {key, cert, port}}) {
  // ensure 'save', 'key', and 'cert' were all valid
  if (valid && key.valid && cert.valid) {
    // convert to JSON-formatted data
    const config = JSON.stringify({
      name,
      key: key.args[0],
      cert: cert.args[0],
      port: (port.valid && port.args[0] || 443),
    }, null, 2)

    // write the config to a file
    fs.writeFileSync(`${__dirname}/${name}.json`, config);
    return console.log(`HTTP2-server: '${name}' created!`);
  }
  // print the help page for 'save' if one was invalid
  simplecmds.help({exit: true, command: 'save'});
}
```

**Explanation**

Our `saveProfile` function will ensure that `save`, `cert`, and `key` were all valid. If that is the case it will create a new file as such: `profileName.json`. Inside this file will contain the name of the profile, key and cert paths, and the port. If the user did not provide a port number it will be the default `443`.

This completes our little program. It doesn't serve much practical use but shows you the various features of this package.

&nbsp;

### Full Code

```javascript
const simplecmds = require('simplecmds');
const fs = require('fs');

const options = {
  description: 'Save HTTP2 server profiles.',
  defaults: {
    rules: '<string>',
    amount: 1,
  }
};

// this string will be used for the 'save' command's help page.
const saveHelp = 'This command lets you create a configuration profile for your server.\n\n\
You must provide a key and certificate in order to create a profile.\n\
You can issue them by running the following commands:\n\n\
  -k --key     Set the private key path\n\
  -c --cert    Set the certificate path\n\n\
You can provide an optional port to change it from the default (443):\n\n\
  -p --port    Set the port number'


// each one of these inherits 'amount' from program option's 'defaults' property.
const commands = {
  save: {
    usage: '-s --save <profile>',
    description: 'Create a new profile',
    callback: saveProfile,
    rules: '<number,string>',
    help: saveHelp,
  },
  key: {
    usage: '-k --key <path>',
    description: 'Set the private key path',
  },
  cert: {
    usage: '-c --cert <path>',
    description: 'Set the certificate path',
  },
  port: {
    usage: '-p --port <number>',
    description: 'Set the port number',
    rules: '<number>',
  }
};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);


function saveProfile({args: [name], valid, commands: {key, cert, port}}) {
  // ensure 'save', 'key', and 'cert' were all valid
  if (valid && key.valid && cert.valid) {
    // convert to JSON-formatted data
    const config = JSON.stringify({
      name,
      key: key.args[0],
      cert: cert.args[0],
      port: (port.valid && port.args[0] || 443),
    }, null, 2)

    // write the config to a file
    fs.writeFileSync(`${__dirname}/${name}.json`, config);
    return console.log(`HTTP2-server: '${name}' created!`);
  }
  // print the help page for 'save' if any commands were invalid
  simplecmds.help({exit: true, command: 'save'});
}

```

This code can be found in the [examples](examples/) directory in this repository as well as two other examples.

&nbsp;

The following command should output the help page for `save`:
```bash
~: node createProfile -s 'profile' -k ./path/to/key
# ... save's help page
```

The following command should create a new profile for us:
```bash
~: node createProfile -s 'profile' -k './path/to/key' -c './path/to/cert'
HTTP2-server: 'profile' created!
```

&nbsp;

## Final Note

I hope this has given you an idea of how to use this package. If you have any questions please read the [wiki](https://github.com/ginsm/simplecmds/wiki) or post an [issue](https://github.com/ginsm/simplecmds/issues) and I'll be happy to help. Feature requests are welcomed as well! 

Links: &nbsp; [[ Wiki ]](https://github.com/ginsm/simplecmds/wiki) &nbsp; [[ Issue Tracker ]](https://github.com/ginsm/simplecmds/issues) &nbsp; [[ NPM ]](https://www.npmjs.com/package/simplecmds)
