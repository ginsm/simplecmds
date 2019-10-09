# **cmds.js**
Easily create CLI commands and type check user given arguments. Features yet to be implemented are noted by an `[*]` following the title.

## **Installing** [*]

```
npm install cmdsjs
```

## **Importing** [*]

```javascript
const cmds = require('cmds');
```

&nbsp;
# **Command creation**
There are two parts to command creation. The methods `.command` and `.rule`.

&nbsp;
## **.command(flags, description, callback)**

### **Flags**
Flags are the keywords that users can use to issue your command. There are three types you can use:
- Short: `-l`
- Long: `--long`
- Alt: `long`

The prefix does not need to be a dash (`-`). It can be any non-letter character *except* `<>` or `[]`. You can only use **two** flags per command; subsequent flags will be ignored.

### **Description**
The description will be used when generating the help menu. This tells the user what the purpose of the command is.

### **Callback** [*]
The callback will be invoked with two arguments: the command's `args` and `valid`. Refer to the help section of `.rule` to understand what `valid` means.

### **Example:**
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
The rule method creates a ruleset for the type of argument(s) and amount of arguments for a command. The rule is applied to the command above it.

*Note: The method is in place but type checking is not. It will add the rule to the command but not enforce it currently.*

### **Notation**
The notation is a string that represents the **type** an argument can be and whether it is required (`<>`) or optional (`[]`).

For example: `'<number> [number,string]'` would dictate that the first argument is **required** and must be a `number`. Subsequent arguments are *optional* and must be either a `number` or a `string`.

Note: When allowing two types you must not put a space inbetween them. `'<number,string>'` is correct. `'<number, string>'` is incorrect.

### **Amount**
The amount dictates how many arguments are allowed. **The amount must be equal to or greater than the amount of required arguments**.

```javascript
// ...
.rule('<number> <string>', 2); // correct

// ...
.rule('<number> <string>', 1); // incorrect
```
### **Example:**

To allow for 2 required arguments and 1 optional the syntax would look like this:
```javascript
cmds
  .command('-f --flag', 'My command', doSomething)
  .rule('<number> <string> [number,string]', 3)
  .parse(process.argv);

  function doSomething(args, valid) {
    if (valid) {
      console.log(args);
    }
  }
```
The first argument must be a `number`, followed by a `string`, and subsequent arguments must be a `number` or `string`. If the end user were to enter more than three arguments, or the wrong type of argument, the valid property would be set to `false`.

This will allow you to handle incorrect user input in whichever way you would like. If no rule was added for a `.command`, the valid state will be `true` by default in your command.