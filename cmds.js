// Node Imports
const basename = require('path').basename;

/**
   * @description Contains the commands during generation.
   */
const Generation = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Build the commands from a given object.
   * @param {Object} commands - Object containing all commands.
   * @return {Private} 'this' for chaining.
   */
  commands(commands) {
    commands = Object.entries(commands)
        .map(([key, command]) => [key, {
          alias: generateAlias(command.usage),
          ...this.defaultRule,
          ...command,
        }]);
    Object.assign(Generation, Object.fromEntries(commands));
    return this;
  },


  // SECTION - Setters
  /**
  * @description Set the program options.
  * @param {Object} options - Program options.
  * @return {Private} 'this' for chaining.
  * @usage
  * There are a few options you can set:
  * - version: string ('v1.0.0')
  * - description: string ('My simple NodeJS program')
  * - defaultRule: array (['<number> [number]', 0])
  * - disableDebug: boolean (true/false)
  */
  set(options) {
    return Object.assign(this, options);
  },

  /**
   * @description Default version value.
   */
  version: 'v1.0.0',

  /**
   * @description Enable debug by default.
   */
  debug: true,

  // SECTION - Help Menu

  /**
   * @description Output the help menu.
   * @param {boolean} exit - Exit program after running.
   */
  help(exit) {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(Generation).map((cmd) => cmd.usage);
    const longestUsage = longest(cmdUsage).length;
    const defaultAmount = this.debug ? -2 : -1;

    // Build command usage and description strings
    const cmds = Object.values(Generation)
        .map((command) => {
          const {usage, description} = command;
          const spaces = Array((longestUsage + 4) - usage.length).join(' ');
          return command.help || `${usage} ${spaces} ${description}`;
        });

    [`Program: ${capitalize(programName)} (${this.version})`,
      this.description && `Description: ${this.description}\n` || '',
      'Commands:',
      ...cmds.slice(0, defaultAmount),
      `\nDefaults:`,
      ...cmds.slice(defaultAmount),
      `\nUsage: ${programName} <command> [...args]`,
    ].forEach((line) => console.log(line));

    if (exit) {
      process.exit();
    }
  },


  // SECTION - Main Parser

  /**
   * @description Parse program args and add them to their command.
   * @param {Array} args - Expects process.argv.
   */
  parse(args) {
    // Add default commands
    addDefaultCommands(this.debug);

    // Remove node env args, expand concat flags, and convert stringed nums
    args = convertNumbers(expandCombinedFlags(args.slice(2)));
    if (args.length == 0) {
      this.help(true);
    }

    // Populate main object with commands & their args + validity.
    const commandArgs = parseArgs(args, Object.entries(Generation));
    iterate(Generation, finalizeCommand.bind(this), commandArgs);
  },
};

module.exports = Cmds;


// SECTION - Parsing Methods

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
          (commands.find(([_, obj]) => obj.alias.includes(arg)) || [])[0];

        const firstArgNotCommand = id == 0 && !command;
        if (firstArgNotCommand) Cmds.help.call(Cmds, true);

        const building = command || prev.building;
        const exists = prev.hasOwnProperty(command) && [...prev[command]];

        const key = command || prev.building;
        const value = command ? exists || [] : [...prev[building], arg];
        return ({...prev, [key]: value, building});
      }, {});
}


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


// SECTION - Building Methods

/**
 * @description Find every valid flag in an usage string.
 * @param {string} usage - Contains command flags.
 * @return {private} Array of found flags (up to 2).
 */
function generateAlias(usage) {
  const flagRegex = /(?<!\S)(-\w\b|--[\w-]{3,}|(?=[^-])[\w-]{3,})/g;
  return usage.match(flagRegex).slice(0, 2) || error(0, usage);
}

/**
 * @description Add the default commands to Generation object.
 * @param {boolean} debug - Debug enabled
 */
function addDefaultCommands(debug) {
  Object.assign(Generation, {
    help: {
      description: 'Output help menu.',
      alias: [aliasConflict('-h'), '--help'],
      usage: `${aliasConflict('-h')} --help`,
      callback: Cmds.help.bind(Cmds),
    },
    ...(debug && {debug: {
      description: 'Output debug information.',
      alias: [aliasConflict('-d'), '--debug'],
      usage: `${aliasConflict('-d')} --debug`,
      callback: () => console.log(Generation),
    }}),
  });
}


/**
 * @description Create the object the end user deals with.
 * @param {*} cmd - Command name.
 * @param {*} obj - Command object.
 * @param {*} args - Object containing command args.
 */
function finalizeCommand(cmd, obj, args) {
  if (args.hasOwnProperty(cmd)) {
    Object.assign(this, {
      [cmd]: {
        args: args[cmd],
        valid: hasProperties(obj, 'rule', 'amount') ?
          typeCheck({
            args: args[cmd].length ? args[cmd] : [true],
            rule: obj.rule,
            amount: obj.amount,
          }) : true,
      },
    });

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
function typeCheck({rule, amount = 0, args}) {
  rule = rule.split(' ');
  const required = rule.filter((rule) => rule[0] === '<');
  const validRequiredAmount = args.length >= required.length;
  const validAmount = args.length <= amount && validRequiredAmount;
  const lastNotation = rule.slice(-1)[0];

  // Check types
  const valid = (rule, arg) => rule.includes(typeof arg);
  const validTypes = args.map((arg, id) => {
    const idRequired = (required.length - 1 >= id);
    const noNotation = (id > rule.length - 1);
    return idRequired ? valid(rule[id], arg) : !idRequired &&
          (noNotation ? valid(lastNotation, arg) : valid(rule[id], arg));
  }).every((arg) => arg === true);

  return (amount ? validAmount : validRequiredAmount) && validTypes;
}


// SECTION - Helper Methods

/**
 * @description Handle conflicting alias'.
 * @param {string} alias - Alias to look up.
 * @return {boolean} Uppercase alias.
 */
function aliasConflict(alias) {
  return Object.values(Generation).filter((command) => {
    return command.alias.includes(alias);
  }).length > 0 && alias.toUpperCase() || alias;
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
