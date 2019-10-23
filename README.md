# **cmds.js** (placeholder)
Easily create CLI commands and type check user given arguments. 

*This project is a work in progress. Features yet to be implemented are noted by an `[*]` following the title.*

##   **Table of contents:** <!-- omit in toc -->

- [**cmds.js** (placeholder)](#cmdsjs-placeholder)
  - [**Installing** [*]](#installing)
  - [**Importing** [*]](#importing)
- [**Command creation**](#command-creation)
  - [**.command(flags, description, callback)**](#commandflags-description-callback)
    - [**Flags**](#flags)
    - [**Description**](#description)
    - [**Callback**](#callback)
    - [**Command Example:**](#command-example)
  - [**.rule(notation, amount)**](#rulenotation-amount)
    - [**Notation**](#notation)
    - [**Amount**](#amount)
    - [**Rule Example:**](#rule-example)
    - [**Valid and invalid commands**](#valid-and-invalid-commands)
- [**Usage**](#usage)
  - [**Simple program**](#simple-program)
- [**Todo**](#todo)

&nbsp;

## **Installing** [*]

```
npm install cmds
```

## **Importing** [*]

```javascript
const cmds = require('cmds');
```

&nbsp;
# **Command creation**
There are two parts to command creation: `.command` and `.rule`.

## **.command(flags, description, callback)**

### **Flags**
Flags are the keywords that users can use to issue your command. There are three types you can use:
- Short: `-l`
- Long: `--long`
- Alt: `long`

You can only use **two** flags per command; subsequent flags will be ignored. The prefix does not need to be a dash (`-`). It can be any non-letter character *except* `<>` or `[]`.

### **Description**
The description will be used when generating the help menu. This tells the user the purpose of the command.

### **Callback**
The callback will be invoked with two arguments: the command's `args` and `valid`. Refer to the help section of `.rule` to understand what `valid` means.

### **Command Example:**
```javascript
cmds
  .command('-s --long', 'My command', doSomething)
  .parse(process.argv);

function doSomething(args) {
  // do something with the args
  console.log(args);
}
```

&nbsp;
## **.rule(notation, amount)**
The rule method creates a ruleset for the type of argument(s) and amount of arguments for a command. The rule is applied to the command above it in the chain.

*Note: The rule method is implemented but type checking is not. It will add the rule to the command but not enforce it currently.*

### **Notation**
The notation is a string that represents the **type** an argument can be and whether it is required (`<>`) or optional (`[]`).

For example: `'<number> [number,string]'` would dictate that the first argument is **required** and must be a `number`. Subsequent arguments are *optional* and must be either a `number` or a `string`.

There are three type of arguments to choose from:
- `number`
- `string`
- `boolean`

Boolean would be the command being present without any arguments following it. This means that the command cannot accept more than one argument:

Example: `.rule('<string,boolean>', 1)`.

Note: When allowing two types you must not put a space inbetween them. `'<number,string>'` is correct. `'<number, string>'` is incorrect.

### **Amount**
The amount dictates how many arguments are allowed. **The amount must be equal to or greater than the amount of required arguments**.

```javascript
// ...
.rule('<number> <string>', 2); // correct

// ...
.rule('<number> <string>', 1); // incorrect
```
### **Rule Example:**

To allow for 2 required arguments and 1 optional the syntax would look like this:
```javascript
cmds
  .command('-f --flag', 'My command', doSomething)
  .rule('<number> <string> [number,string]', 3)
  .parse(process.argv);

  function doSomething(args, valid) {
    if (valid) {
      // If valid do something with the args
      console.log(args);
    }
  }
```
The first argument must be a `number`, second must be a `string`, and subsequent arguments must be a `number` or `string`. If the user were to enter more than three arguments, or the wrong type of argument, the valid property would be set to `false`.

This will allow you to handle incorrect user input in whichever way you would like. If no rule was added for a `.command`, the valid state will be `true` by default in your command.

### **Valid and invalid commands**

Using the example above, here are what valid and invalid commands would look like:

Valid commands:
```
node yourProgram -f 10 'this is a string'
node yourProgram -f 10 'this is a string' 12
node yourProgram -f 10 'this is a string' 'another string'
```

Invalid commands:
```
node yourProgram -f 'this is a string' 10  <- wrong type(s)
node yourProgram -f 10  <- missing required (second argument)
node yourProgram -f 10 'this is a string' 10 12  <- too many args
```

&nbsp;
# **Usage**
This module uses method chaining to construct your command line interface. The last method must be `.parse()` which requires `process.argv` as an argument.

## **Simple program**
To demonstrate the usage, lets build a simple program. Create a file called 'myProgram.js' and insert the following code:

```javascript
// import module
const cmds = require('cmds');

// create a command using .command and .rule (echo)
cmds
  .command('-e --echo <text>', 'Echos the given message', echo)
  .rule('<string,number>', 1)
  .parse(process.argv);

// accepts only one argument: a string or number.
function echo(args, valid) {
  if (valid) {
    console.log(args[0]);
  } else {
    cmds.showHelp();
  } 
}
```

Running `node myProgram -e 'message to echo'` would result in an output of '`message to echo`' to stdout.

# **Todo**
```
[x] Allow for various prefixes .create, -create, *create, so on.
[x] Concatenated short flags.
[x] Boolean commands.
[x] Fix not iterable lastBuilt err.
[x] Implement type checking.
[x] Help Menu.
[x] Create a separate object for building the commands.
[x] Handle callbacks.
[x] Handle default commands (help & version).
[x] Add version setter and getter.
[ ] Add custom help description.
[ ] Fix parseArgs acting as a set instead of an array.
[ ] .exec() function that executes a shell cmd on command being issued.
[ ] Rework error handling
```