// Node Imports
const basename = require('path').basename;

/**
   * @description Contains the commands during generation.
   */
const Generation = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Create a command.
   * @param {string} usage - Usable command flags.
   * @param {string} description - Description of the command.
   * @param {Object} callback - Callback to be used with function
   * @return {Object} 'this' for chaining.
   */
  command(usage = '', description = '', callback = false) {
    const flags = parseFlags(usage);
    const command = camelCase(longest(flags));

    Generation[command] = {
      description,
      flags,
      usage,
      callback,
    };

    return this;
  },


  /**
   * @description Create a validation rule.
   * @param {string} notation - String notation of types.
   * @param {number} amount - Acceptable amount of arguments.
   * @return {private} 'this' for chaining.
   */
  rule(notation = '', amount = 0) {
    const command = lastBuiltCmd();
    const cmdObject = Generation[command];

    Generation[command] = {
      ...cmdObject,
      notation: notation.split(' '),
      amount,
    };

    return this;
  },


  // SECTION - Main Parser

  /**
   * @description Parse program args and add them to their command.
   * @param {Array} args - Expects process.argv.
   */
  parse(args) {
    // Remove node env args, expand concat flags, and convert string nums
    args = handleDefaults(convertNumbers(expandCombinedFlags(args.slice(2))));
    const commandArgs = parseArgs(args, Object.entries(Generation));

    // Clean up main object
    ['description', 'setVersion', 'command',
      'help', 'rule', 'parse'].forEach((item) =>
      delete this[item]
    );

    // Populate main object with commands & their args + validity.
    iterate(Generation, finalizeCommands.bind(this), commandArgs);
  },


  // SECTION - Setters

  /**
   * @description Set the version number.
   * @param {*} vers - Version number.
   * @return {Object} 'this' for chaining.
   */
  setVersion(vers) {
    this.version = vers;
    return this;
  },

  version: 'v1.0.0',

  /**
   * @description Set a description for your program.
   * @param {string} message - Description message.
   * @return {Object} 'this' for chaining.
   */
  description(message) {
    this.description = message;
    return this;
  },


  // SECTION - Help Menu

  /**
   * @description Print a help menu and exit program process.
   * @return {private} Exit process.
   */
  showHelp() {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(Generation).map((cmd) => cmd.usage);
    const longestUsage = longest(cmdUsage).length;
    const descriptionExists = typeof this.description == 'string';

    // Create string with n spaces.
    const space = (length) => Array(length).join(' ');

    // Build command usage and description strings
    const cmds = Object.values(Generation)
        .map((command) => {
          const {usage, description} = command;
          const spaces = space((longestUsage + 3) - usage.length);
          return command.help || `${usage} ${spaces} ${description}`;
        });

    // Contains more static content
    const menu = [
      `Program: ${capitalize(programName)} (${this.version})`,
      descriptionExists && `Description: ${this.description}\n` || '',
      'Commands:',
      ...cmds,
      '\nDefaults:',
      `-h --help ${space((longestUsage + 3) - 9)} Output help menu.`,
      `-v --version ${space((longestUsage + 3) - 12)} Output version number.`,
      `-d --debug ${space((longestUsage + 3) - 10)} Output debug info.`,
      `\nUsage: ${programName} <command> [...args]`,
    ];

    menu.forEach((line) => console.log(line));
    return process.exit();
  },
};

module.exports = Cmds;


// SECTION - Parsing Methods

/**
 * @description Find every valid flag in an usage string.
 * @param {string} usage - Contains command flags.
 * @return {private} Array of found flags (up to 2).
 */
function parseFlags(usage) {
  const flagRegex = /(?<!\S)(-\w\b|--[\w-]{3,}|(?=[^-])[\w-]{3,})/g;
  return usage.match(flagRegex).slice(0, 2) || error(0, usage);
}


/**
 * @description Generate an object containing commands and their args.
 * @param {Array} args - Process.argv
 * @param {Object[]} commands - Object containing commands.
 * @return {Object} Generated object containing args.
 */
function parseArgs(args, commands) {
  return args
      .reduce((prev, arg, id) => {
        const command =
          (commands.find(([cmd, obj]) => obj.flags.includes(arg)) || [])[0];

        const firstArgNotCommand = id == 0 && !command;
        if (firstArgNotCommand) error(1);

        const building = command || prev.building;
        const exists = prev.hasOwnProperty(command) && [...prev[command]];

        const key = command || prev.building;
        const value = command ? exists || [] : [...prev[building], arg];
        return ({...prev, [key]: value, building});
      }, {});
}


/**
 * @description Invoke default command handlers.
 * @param {Array} args - Process.argv.
 * @return {Array} Args with default commands removed.
 */
function handleDefaults(args) {
  (args.length == 0) && Cmds.showHelp();
  const defaults = [
    {flags: ['-v', '--version'], ran: false, callback:
      () => console.log(Cmds.version)},
    {flags: ['-d', '--debug'], ran: false, callback:
      () => console.log(Generation)},
    {flags: ['-h', '--help'], ran: false, callback: Cmds.showHelp.bind(Cmds)},
  ];

  for (const obj of defaults) {
    args.forEach((arg) => {
      if (obj.flags.includes(arg)) {
        args.splice(args.indexOf(arg), 1);
        !obj.ran && (obj.callback && obj.callback());
        obj.ran = true;
      };
    });
  };

  // terminate early if no other args
  return args.length && args || process.exit();
}


// SECTION - Building Methods

/**
 * @description - Expand combined short flags.
 * @param {Array} arr - Argument array.
 * @return {Array} Array with expanded short flags at the beginning.
 */
function expandCombinedFlags(arr) {
  const exp = {
    concatenated: /(?<!\S)\W\w{2,}/,
    inbetweenChars: /(?<!\W)(?=\w)/g,
    byFlag: /(?=\W)/g,
  };

  // Expand any concatenated flags into short flags (in place)
  return flatten(arr.map((arg) => exp.concatenated.test(arg) ?
      arg.replace(exp.inbetweenChars, '-').split(exp.byFlag) : arg
  ));
}


/**
 * @description Create the object the end user deals with.
 * @param {*} cmd - Command name.
 * @param {*} obj - Command object.
 * @param {*} args - Object containing command args.
 */
function finalizeCommands(cmd, obj, args) {
  if (args.hasOwnProperty(cmd)) {
    // Insert true if no args present (boolean cmd)
    this[cmd] = {args: args[cmd].length ? args[cmd] : [true]};

    // Typecheck arguments
    if (hasProperties(obj, 'notation', 'amount')) {
      this[cmd].valid = typeCheck({
        args: this[cmd].args,
        notation: obj.notation,
        amount: obj.amount,
      });
    } else {
      this[cmd].valid = true;
    }

    // Run callback for command
    if (obj.callback) {
      const {args, valid} = this[cmd];
      obj.callback(args, valid);
    }
  }
}


// SECTION - Type checking

/**
 * @description Check the types and amount of args for a command.
 * @param {Array} obj - Command name and object.
 * @return {boolean} Validity represented by a boolean.
 */
function typeCheck({notation, amount = 0, args}) {
  const required = notation.filter((notation) => notation[0] === '<');
  const validRequiredAmount = args.length >= required.length;
  const validAmount = args.length <= amount && validRequiredAmount;
  const lastNotation = notation.slice(-1)[0];

  // Check types
  const valid = (notation, arg) => notation.includes(typeof arg);
  const validTypes = args.map((arg, id) => {
    const idRequired = (required.length - 1 >= id);
    const noNotation = (id > notation.length - 1);
    return idRequired ? valid(notation[id], arg) : !idRequired &&
          (noNotation ? valid(lastNotation, arg) : valid(notation[id], arg));
  }).every((arg) => arg === true);

  return (amount ? validAmount : validRequiredAmount) && validTypes;
}


// SECTION - Helper Methods


/**
 * @description Get last command built.
 * @return {string} Name of the last command built.
 */
function lastBuiltCmd() {
  return Object.keys(Generation).slice(-1)[0];
}


/**
 * @description Run a callback for each property in an object.
 * @param {Object} obj - Object to iterate.
 * @param {*} callback - Receives property and its value.
 * @param {*} optional - Optional parameter to pass to callback.
 */
function iterate(obj, callback, optional) {
  for (const prop in obj) {
    if (obj[prop]) {
      callback(prop, obj[prop], optional);
    }
  }
}


/**
 * @description Remove any dashes and camel case a string.
 * @param {string} str - String to normalize.
 * @return {string} Normalized string.
 */
function camelCase(str) {
  const camelCaseString = (word, id) => id == 0 && word.toLowerCase() ||
        word[0].toUpperCase() + word.substr(1).toLowerCase();
  return str.match(/[\w]+(?=[A-Z])|[\w]+/g).map(camelCaseString).join('');
}


/**
 * @description Capitalize the first letter of a word.
 * @param {string} word - Word to capitalize.
 * @return {string} Capitalized word.
 */
function capitalize(word) {
  return word[0].toUpperCase() + word.substr(1);
}


/**
 * @description Find the longest string in an array.
 * @param {string[]} arr - Array of strings.
 * @return {string} Longest string.
 */
function longest(arr) {
  return arr.reduce((a, b) => b.length > a.length ? b : a);
}


/**
 * @description Convert any stringed number to a number.
 * @param {*} input - Value(s) to be converted.
 * @return {*} - Returns the input after attempting conversion.
 */
function convertNumbers(input) {
  const convertNum = (arg) => +arg ? +arg : arg;
  return Array.isArray(input) && input.map(convertNum) || convertNum(input);
}


/**
 * @description Flatten an array.
 * @param {Array} arr - Array to flatten
 * @return {Array} The flattened array.
 */
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}


/**
 * @description Check an object for multiple properties.
 * @param {{}} obj - Object to check.
 * @param  {...any} properties - Properties to check.
 * @return {boolean} Result of the check.
 */
function hasProperties(obj, ...properties) {
  return properties.map((property) => obj.hasOwnProperty(property))
      .every((value) => value == true);
}


// SECTION - Errors

/**
 * @description - Dispatch an error and exit process.
 * @param {number} code - Error code.
 * @param {*} value - Relevant information.
 */
function error(code, value) {
  const errors = [
    `Creation: No flags present in command '${value}'.`,
    `First argument must be a valid command. Type -h.`,
  ];
  console.error(`[Error] ${errors[code]}`);
  process.exit();
}
