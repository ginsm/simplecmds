// Node Imports
const basename = require('path').basename;

/**
   * @description Contains the commands during generation.
   */
const Generation = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Get last command built.
   * @return {string} Name of the last command built.
   */
  lastBuilt() {
    return Object.keys(Generation).slice(-1)[0];
  },


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
    const command = this.lastBuilt();
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
    const command = this.lastBuilt();
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
    args = convertNumbers(expandCombinedFlags(args.slice(2)));
    (!args.length) && this.showHelp();
    const commandArgs = parseArgs(args, Object.entries(Generation));

    // Populate main object with commands & their args + validity.
    iterate(Generation, finalizeCommands.bind(this), commandArgs);

    // Clean up main object
    ['command', 'lastBuilt', 'help', 'rule', 'parse'].forEach((item) =>
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

    // Build command usage
    const cmds = Object.values(Generation)
        .map((command) => {
          const {usage, description} = command;
          const spaces = Array((longestUsage + 3) - usage.length).join(' ');
          return command.help || `${usage} ${spaces} ${description}`;
        });

    const menu = [
      `${programName[0].toUpperCase() + programName.substr(1)} Help Menu\n`,
      ...cmds,
      `\nUsage: ${programName} <command> [arg]`,
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
    return isShortFlag || flag.length >= 4;
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


// SECTION - Building Methods

/**
 * @description Creates the object the end user deals with.
 * @param {*} cmd - Command name.
 * @param {*} obj - Command object.
 * @param {*} args - Object containing command args.
 */
function finalizeCommands(cmd, obj, args) {
  // Resolve arguments
  if (args.hasOwnProperty(cmd)) {
    this[cmd] = {args: args[cmd].length ? args[cmd] : [true]};
  }

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
  const expanded = flatten(arr.map((arg) => {
    return exp.concatenated.test(arg) ?
      arg.replace(exp.inbetweenChars, '-').split(exp.byFlag) : arg;
  }));

  // Removing duplicates so there's less to iterate over
  return [...new Set(expanded)];
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
 * @description Run a callback for each property in an object.
 * @param {Object} obj - Object to iterate.
 * @param {*} callback - Receives property and its value.
 * @param {*} optional - Optional parameter to pass to callback.
 */
function iterate(obj, callback, optional) {
  for (const prop in obj) {
    if (obj[prop] !== null) {
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
