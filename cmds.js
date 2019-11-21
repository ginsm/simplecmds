// Node Imports
const basename = require('path').basename;

/**
   * @description Contains the commands during building.
   */
const Builder = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Build the commands from a given object.
   * @param {Object} commands - Object containing all commands.
   * @return {Private} 'this' for chaining.
   * @usage
   * Refer to the README documentation.
   */
  commands(commands) {
    commands = Object.entries(commands)
        .map(([key, command]) => [key, {
          alias: generateAlias(command.usage, key),
          ...this.defaultRule,
          ...command,
        }]);
    Object.assign(Builder, Object.fromEntries(commands));
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
   * @description Disable debug by default.
   */
  debug: false,

  // SECTION - Help Menu

  /**
   * @description Output the help menu.
   * @param {boolean} exit - Exit program after running.
   */
  help(exit) {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(Builder).map((cmd) => cmd.usage);
    const longestUsage = longestString(cmdUsage).length;
    const defaultAmount = this.debug ? -2 : -1;

    // Build command usage and description strings
    const cmds = Object.values(Builder)
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
   * @description Parse process.argv and process the arguments.
   * @param {Array} args - Expects process.argv.
   * @return {Private} An object containing commands, their args, and validity.
   */
  parse(args = args.slice(2)) {
    addDefaultCommands(this.debug);
    args = convertNumbers(expandConcat(args.slice(2)));
    (!args.length && this.help(true));
    const commands =
      buildCommands(resolveArgs(args, Object.entries(Builder)));
    issueCallbacks(commands);
    return commands;
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
function resolveArgs(args, commands) {
  return args
      .reduce((prev, arg, id) => {
        const command =
          (commands.find(([_, obj]) => obj.alias.includes(arg)) || [])[0];

        const firstArgNotCommand = id == 0 && !command;
        if (firstArgNotCommand) {
          Cmds.help.call(Cmds, true);
        }

        const building = command || prev.building;
        const exists = prev.hasOwnProperty(command) && [...prev[command]];

        const key = command || prev.building;
        const value = command ? exists || [] : [...prev[building], arg];
        return ({...prev, [key]: value, building});
      }, {});
}


/**
 * @description - Expand concatenated short aliases.
 * @param {Array} arr - Argument array.
 * @return {Array} Array with expanded short aliases (in place).
 */
function expandConcat(arr) {
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
 * @description Find every valid alias in an usage string.
 * @param {string} usage - Contains command aliases.
 * @param {string} command - The
 * @return {private} Array of found aliases (up to 2).
 */
function generateAlias(usage, command) {
  const flagRegex = /(?<!\S)(-\w\b|--[\w-]{3,}|(?=[^-])[\w-]{3,})/g;
  return usage.match(flagRegex).slice(0, 2) || error(0, command);
}


/**
 * @description Add the default commands to Builder object.
 * @param {boolean} debug - Enable the debug command.
 */
function addDefaultCommands(debug) {
  Object.assign(Builder, {
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
      callback: () => console.log(Builder),
    }}),
  });
}


/**
 * @description Handle conflicting aliases.
 * @param {string} alias - Alias to look up.
 * @return {boolean} A non-conflicting alias.
 */
function aliasConflict(alias) {
  return Object.values(Builder).filter((command) => {
    return command.alias.includes(alias);
  }).length > 0 && alias.toUpperCase() || alias;
}


/**
 * @description Build each command's object.
 * @param {*} args - The processed arguments.
 * @return {Object} The built commands.
 */
function buildCommands(args) {
  const commands = {};
  for (const cmd in Builder) {
    if (Builder[cmd]) {
      Object.assign(commands, build.call(Cmds, cmd, Builder[cmd], args));
    }
  }
  return commands;
}


/**
 * @description Builds individual command objects.
 * @param {*} cmd - Command name.
 * @param {*} obj - Builder object.
 * @param {*} args - Object containing command args.
 * @return {Object} The built command.
 */
function build(cmd, obj, args) {
  if (args.hasOwnProperty(cmd)) {
    const commandObject = {
      [cmd]: {
        args: args[cmd],
        valid: obj.hasOwnProperty('rule') ?
          typeCheck({
            args: args[cmd].length ? args[cmd] : [true],
            rule: obj.rule,
            amount: obj.amount,
          }) : true,
      },
    };
    Object.assign(this, commandObject);
    return commandObject;
  }
}


/**
 * @description Issue each command's callback function.
 * @param {Object} that - 'this' context of main object (Cmds).
 */
function issueCallbacks(that) {
  Object.entries(Builder).forEach(([cmd, obj]) => {
    if (that[cmd]) {
      const {args, valid} = that[cmd];
      if (obj.callback) {
        obj.callback(args, valid, that);
      }
    }
  });
}


// SECTION - Type checking

/**
 * @description Validate the types and amount of args for a command.
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
function longestString(arr) {
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


// SECTION - Errors

/**
 * @description - Dispatch an error and exit process.
 * @param {number} code - Error code.
 * @param {*} value - Relevant information.
 */
function error(code, value) {
  const errors = [
    `Creation: No valid aliases present in command '${value}'.`,
  ];
  console.error(`[Error] ${errors[code]}`);
  process.exit();
}
