// Node Imports
const basename = require('path').basename;

/**
   * Contains the commands during building.
   */
const Builder = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * Build the commands from a given object.
   * @param {Object} commands - Object containing all commands.
   * @example
   * {
   *  myCommand: {
   *    usage: '-c --my-command <text>',
   *    description: 'My command',
   *    // called with (args, valid, commands)
   *    callback: myFunction,
   *    // first arg must be a string
   *    rule: '<string>',
   *    // only one arg accepted
   *    amount: 1,
   *  },
   * }
   * @return {Private} 'this' for chaining.
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
  * Set the program options.
  * @param {Object} options - Program options.
  * @example
  * {
  *   version: 'v1.0.0',
  *   descrition: 'My simple NodeJS Program',
  *   defaultRule: {
  *     // first arg must be a number
  *     // subsequent args must be as well
  *     rule: '<number> [number]',
  *     // unlimited arg amount
  *     amount: 0,
  *   },
  *   debug: true,
  * }
  * @return {Private} 'this' for chaining.
  */
  set(options) {
    return Object.assign(this, options);
  },


  /**
   * Default version value.
   */
  version: 'v1.0.0',


  /**
   * Disable debug by default.
   */
  debug: false,


  // SECTION - Help Menu

  /**
   * Output the program's help menu.
   * @param {boolean} exit - Exit program after running.
   * @return {Private} Exit status.
   */
  help(exit) {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(Builder).map((cmd) => cmd.usage);
    const longestUsage = longestString(cmdUsage);
    const defaultAmount = this.debug ? -2 : -1;

    // Build command usage and description strings
    const cmds = Object.values(Builder).map(({usage, description}) => {
      const spaces = Array((longestUsage + 4) - usage.length).join(' ');
      return `${usage} ${spaces} ${description}`;
    });

    [`Program: ${capitalize(programName)} (${this.version})`,
      this.description && `Description: ${this.description}\n` || '',
      'Commands:',
      ...cmds.slice(0, defaultAmount),
      `\nDefaults:`,
      ...cmds.slice(defaultAmount),
      `\nUsage: ${programName} <command> [...args]`,
    ].forEach((line) => console.log(line));

    return (exit && process.exit());
  },


  // SECTION - Main Parser

  /**
   * Parse process.argv and process the arguments.
   * @param {Array} args - Expects process.argv.
   * @return {Private} An object containing commands, their args, and validity.
   * @example
   * {
   *  myCommand: {
   *    args: [1, 2],
   *    valid: true,
   *  },
   *  myOtherCommand: {
   *    args: [3, 4],
   *    valid: false,
   *  }
   * }
   */
  parse(args) {
    addDefaultCommands.call(this);

    // Resolve arguments
    args = convertNumbers(expandConcat(args.slice(2)));
    (!args.length && this.help(true));

    // Command building
    const commands =
        buildCommands(parseArgs(args, Object.entries(Builder)));

    return issueCallbacks(commands);
  },
};

module.exports = Cmds;


// SECTION - Parsing Methods

/**
 * Generate an object containing commands and their args.
 * @param {Array} args - Process.argv
 * @param {Object[]} commands - Object containing commands.
 * @return {Object} Generated object containing args.
 * @example
 * { myCommand: [1, 2] }
 */
function parseArgs(args, commands) {
  return args
      .reduce((prev, arg, id) => {
        const command = (commands.find(([_, obj]) => {
          return obj.alias.includes(arg);
        }) || [])[0];
        ((id == 0 && !command) && Cmds.help.call(Cmds, true));
        const building = command || prev.building;
        const exists = prev.hasOwnProperty(command) && [...prev[command]];
        const key = command || prev.building;
        const value = command ? exists || [] : [...prev[building], arg];
        return ({...prev, [key]: value, building});
      }, {});
}


/**
 * Expand concatenated short aliases (in place).
 * @param {Array} arr - Array to parse.
 * @return {Array} Array with expanded short aliases.
 * @example
 * expandConcat(['-m', 1, '-abf', 2]);
 * // output -> ['-m', 1, '-a', '-b', '-f', 2]
 */
function expandConcat(arr) {
  // Expand any concatenated flags into short flags (in place)
  return flatten(arr.map((arg) => /(?<!\S)-\w{2,}/.test(arg) ?
      arg.replace(/(?<!\W)(?=\w)/g, '-').split(/(?=\W)/g) : arg
  ));
}


// SECTION - Building Methods

/**
 * Find every valid alias in an usage string.
 * @param {string} usage - Contains command aliases.
 * @param {string} command - The
 * @return {private} Array of found aliases (up to 2).
 * @example
 * generateAlias('-m --my-command [number]', 'myCommand');
 * // output -> ['-m', '--my-command']
 */
function generateAlias(usage, command) {
  const flagRegex = /(?<!\S)(-\w\b|--[\w-]{3,}|(?=[^-])[\w-]{2,})/g;
  return usage.match(flagRegex).slice(0, 2) || error(0, command);
}


/**
 * Add the default commands to Builder object.
 * @param {boolean} debug - Enable the debug command.
 */
function addDefaultCommands() {
  Object.assign(Builder, {
    help: {
      description: 'Output help menu.',
      alias: [aliasConflict('-h'), '--help'],
      usage: `${aliasConflict('-h')} --help`,
      callback: Cmds.help.bind(Cmds),
    },
    ...(this.debug && {debug: {
      description: 'Output debug information.',
      alias: [aliasConflict('-d'), '--debug'],
      usage: `${aliasConflict('-d')} --debug`,
      callback: () => console.log(Builder),
    }}),
  });
}


/**
 * Handle conflicting aliases.
 * @param {string} alias - Alias to look up.
 * @return {boolean} A non-conflicting alias.
 * @example
 * // another command uses -h
 * aliasConflict('-h');
 * // output -> '-H'
 */
function aliasConflict(alias) {
  return Object.values(Builder).filter((command) => {
    return command.alias.includes(alias);
  }).length > 0 && alias.toUpperCase() || alias;
}


/**
 * Build each command's object.
 * @param {*} args - The processed arguments.
 * @return {Object} Args and validity for each command.
 * @example
 * {
 *  myCommand: {
 *    args: [1, 2],
 *    valid: true,
 *  },
 *  myOtherCommand: {
 *    args: [3, 4],
 *    valid: false,
 *  }
 * }
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
 * Builds individual command objects.
 * @param {*} cmd - Command name.
 * @param {*} obj - Builder object.
 * @param {*} args - Object containing command args.
 * @return {Object} The built command.
 * @example
 * {
 *  myCommand: {
 *    args: [1, 2],
 *    valid: true,
 *  }
 * }
 */
function build(cmd, obj, args) {
  if (args.hasOwnProperty(cmd)) {
    const cmdArgs = args[cmd].slice(0, obj.amount);
    const commandObject = {
      [cmd]: {
        args: cmdArgs,
        valid: obj.hasOwnProperty('rule') ?
          typeCheck({
            args: cmdArgs.length ? cmdArgs : [true],
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
 * Issue each command's callback function.
 * @param {Object} commands - The end-user command object.
 * @return {Object} - The end-user command object (untouched).
 */
function issueCallbacks(commands) {
  Object.entries(Builder).forEach(([cmd, obj]) => {
    if (commands[cmd]) {
      const {args, valid} = commands[cmd];
      if (obj.callback) {
        obj.callback(args, valid, commands);
      }
    }
  });
  return commands;
}


// SECTION - Type checking

/**
 * Validate the types and amount of args for a command.
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
 * Capitalize the first letter of a word.
 * @param {string} word - Word to capitalize.
 * @return {string} Capitalized word.
 * @example
 * capitalize('hello');
 * // output -> 'Hello'
 */
function capitalize(word) {
  return word[0].toUpperCase() + word.substr(1);
}


/**
 * Find the longest string in an array.
 * @param {string[]} arr - Array of strings.
 * @return {string} Length of the longest string.
 */
function longestString(arr) {
  return arr.reduce((a, b) => b.length > a.length ? b : a).length;
}


/**
 * Convert any stringed number to a number.
 * @param {*} input - Value(s) to be converted.
 * @return {*} - Returns the input after attempting conversion.
 * @example
 * convertNumbers('12');
 * // output -> 12
 * convertNumbers(['test', '13', '15']);
 * // output -> ['test', 13, 15]
 */
function convertNumbers(input) {
  const convertNum = (arg) => +arg ? +arg : arg;
  return Array.isArray(input) && input.map(convertNum) || convertNum(input);
}


/**
 * Flatten an array.
 * @param {Array} arr - Array to flatten
 * @return {Array} The flattened array.
 */
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}


// SECTION - Errors

/**
 * - Dispatch an error and exit process.
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
