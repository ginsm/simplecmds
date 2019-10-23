// Node Imports
const basename = require('path').basename;

/**
   * @description Contains the commands during generation.
   */
const Generation = {};

const Cmds = {
  // SECTION - Object Creation

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
   * @description Create a command.
   * @param {string} flagString - Usable command flags.
   * @param {string} description - Description of the command.
   * @param {Object} callback - Callback to be used with function
   * @return {private} 'this' for chaining.
   */
  command(flagString = '', description = '', callback = false) {
    const flags = parseFlags(flagString);
    const command = camelCase(longest(flags));

    Generation[command] = {
      description,
      flags,
      usage: flagString,
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

  /**
   * @description Assigns a custom help message to a command.
   * @param {string} message - Custom help message.
   * @return {private} 'this' for chaining.
   */
  help(message) {
    const command = lastBuiltCmd();
    const cmdObject = Generation[command];

    Generation[command] = {
      ...cmdObject,
      help: message,
    };

    return this;
  },


  // SECTION - Main Parser

  /**
   * @description Parse program args and add them to their command.
   * @param {[]} args - Expects process.argv.
   */
  parse(args) {
    // Remove node env args, expand concat flags, and convert nums
    args = handleDefaults(convertNumbers(expandCombinedFlags(args.slice(2))));
    const commandArgs = parseArgs(args, Object.entries(Generation));

    // Populate main object with commands & their args + validity.
    iterate(Generation, finalizeCommands.bind(this), commandArgs);

    // Clean up main object
    ['setVersion', 'command', 'help', 'rule', 'parse'].forEach((item) =>
      delete this[item]
    );
  },


  // SECTION - Help Menu

  /**
   * @description Prints a help menu and exits program process.
   * @param {Object} commands - Program commands.
   */
  showHelp() {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(Generation).map((cmd) => cmd.usage);
    const longestUsage = longest(cmdUsage).length;

    // Create string with n spaces.
    const space = (length) => Array(length).join(' ');

    // Build command usage
    const cmds = Object.values(Generation)
        .map((command) => {
          const {usage, description} = command;
          const spaces = space((longestUsage + 3) - usage.length);
          return command.help || `${usage} ${spaces} ${description}`;
        });

    const menu = [
      `Program: ${capitalize(programName)} (${this.version})\n`,
      'Commands:',
      ...cmds,
      '\nDefaults:',
      `-h --help ${space((longestUsage + 3) - 9)} Output help menu.`,
      `-v --version ${space((longestUsage + 3) - 12)} Output version number.`,
      `\nUsage: ${programName} <command> [...args]`,
    ];

    menu.forEach((line) => console.log(line));

    process.exit();
  },
};

module.exports = Cmds;


// SECTION - Parsing Methods

/**
 * @description Parses and validates the flags for consumption.
 * @param {string} flags - Command flags.
 * @return {private} Array of possible command names.
 */
function parseFlags(flags) {
  // Find all valid flags in the provided string
  const flagRegex = /(?<!([<\w\[]))[^\s<\[,]+/g;
  flags = flags.match(flagRegex).slice(0, 2) || error(0, flags);

  // Validate a flag
  const flagValid = (flag) => {
    const isShortFlag = flag.length === 2 && /\S[\w]/.test(flag);
    return isShortFlag || flag.length >= 3;
  };

  // Make sure every flag is valid
  return flags.every(flagValid) && flags || error(1, flags);
}


/**
 * @description Generates an object containing commands and their args.
 * @param {[]} args - Process.argv
 * @param {[]} commands - Object containing commands.
 * @return {Object} Generated object containing args.
 */
function parseArgs(args, commands) {
  return args
      .reduce((prev, arg, id) => {
        // Resolve whether it's a command or not
        const getCommand = commands
            .find((cmd) => cmd[1].flags.includes(arg)) || false;
        const command = getCommand ? getCommand[0] : false;

        const firstArgNotCommand = id == 0 && !command;
        if (firstArgNotCommand) error(3);

        // Used for key/value building
        const building = command || prev.building;
        const exists = prev.hasOwnProperty(command) && [...prev[command]];

        // Object construction
        const key = command || prev.building;
        const value = command ? exists || [] : [...prev[building], arg];
        return ({...prev, [key]: value, building});
      }, {});
}


/**
 * @description Invoke default command handlers.
 * @param {[]} args - Process.argv.
 * @return {[]} Args with default commands removed.
 */
function handleDefaults(args) {
  (args.length == 0) && Cmds.showHelp();

  const defaults = [
    {flags: ['-v', '--version'], ran: false, callback: showVersion},
    {flags: ['-h', '--help'], ran: false, callback: Cmds.showHelp},
  ];

  for (const obj of defaults) {
    args.forEach((arg) => {
      const found = obj.flags.includes(arg);
      if (found) {
        args.splice(args.indexOf(arg), 1);
        !obj.ran && (obj.callback && obj.callback());
        obj.ran = true;
      };
    });
  };

  // terminating early if no other args
  return args.length && args || process.exit();
}


// SECTION - Building Methods

/**
 * @description Creates the object the end user deals with.
 * @param {*} cmd - Command name.
 * @param {*} obj - Command object.
 * @param {*} args - Object containing command args.
 */
function finalizeCommands(cmd, obj, args) {
  if (args.hasOwnProperty(cmd)) {
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


/**
 * @description - Expands combined short flags.
 * @param {[]} arr - Argument array.
 * @return {[]} Array with expanded short flags at the beginning.
 */
function expandCombinedFlags(arr) {
  const exp = {
    concatenated: /(?<!\S)\W\w{2,}/,
    inbetweenChars: /(?<!\W)(?=\w)/g,
    byFlag: /(?=\W)/g,
  };

  // Expand any concatenated flags into short flags (in place)
  return flatten(arr.map((arg) => {
    return exp.concatenated.test(arg) ?
      arg.replace(exp.inbetweenChars, '-').split(exp.byFlag) : arg;
  }));
}


// SECTION - Type checking

/**
 * @description Check the types and amount of args for a command.
 * @param {[]} obj - Command name and object.
 * @return {boolean} Validity represented by a boolean.
 */
function typeCheck({notation, amount, args}) {
  const required = notation.filter((notation) => notation[0] === '<');
  const optional = notation.slice(required.length);
  const validAmount = args.length <= amount && args.length >= required.length;

  // Type checking
  const lastOptional = optional.slice(-1)[0];
  const valid = (notation, arg) => notation.includes(typeof arg);
  const validTypes = args.map((arg, id) => {
    const idRequired = (id <= required.length - 1);
    const noNotation = (id > notation.length - 1);
    const currNotation = notation[id];

    return idRequired ? valid(currNotation, arg) : optional.length &&
          (noNotation ? valid(lastOptional, arg) : valid(currNotation, arg));
  }).every((arg) => arg === true);

  return validAmount && validTypes;
}


// SECTION - Helper Methods

/**
 * @description Output the version number.
 */
function showVersion() {
  console.log(Cmds.version);
}


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
 * @description Finds the longest string in an array.
 * @param {[string]} arr - Array of strings.
 * @return {string} Longest string.
 */
function longest(arr) {
  return arr.reduce((a, b) => b.length > a.length ? b : a);
}


/**
 * @description Converts any stringed number to a number.
 * @param {*} input - Value(s) to be converted.
 * @return {*} - Returns the input after attempting conversion.
 */
function convertNumbers(input) {
  const isArray = Array.isArray(input);
  const convertNum = (arg) => +arg ? +arg : arg;
  return isArray && input.map(convertNum) || convertNum(input);
}


/**
 * @description Flattens an array.
 * @param {[]} arr - Array to flatten
 * @return {[]} The flattened array.
 */
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}


/**
 * @description
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
 * @description - Dispatches an error and exits process.
 * @param {number} code - Error code.
 * @param {*} value - Relevant information.
 */
function error(code, value) {
  // Contains error messages
  const errors = [
    `No flags present in command '${value}'.`,
    `Unable to create command '${value}'.`,
    `Sorry, no commands were provided. Type -h.`,
    `First argument must be a valid command. Type -h.`,
  ];

  // Log error and exit
  console.error(`[Error] ${errors[code]}`);
  process.exit();
}
