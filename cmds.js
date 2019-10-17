// Node Imports
const basename = require('path').basename;

/*
  TODO -
  [x] Allow for various prefixes .create, -create, *create, so on.
  [ ] .exec() function that executes a shell cmd on command being issued
  [x] Concatenated short flags
  [x] Boolean commands
  [x] Fix not iterable lastBuilt err
  [ ] Implement type checking
  [x] Help Menu
      [ ] Add -h --help commands by default.
*/

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Contains the commands.
   */
  commands: {},


  /**
   * @return {string[]} Existing command names.
   */
  cmds() {
    return Object.keys(this.commands);
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

    // Add command to the commands object
    this.commands[command] = {
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
    // Used to get last command made in the method chain
    const command = this.cmds().slice(-1)[0];
    const cmdObject = this.commands[command];

    // Add rule to last command's object
    this.commands[command] = {
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
    const command = this.cmds().slice(-1)[0];
    const cmdObject = this.commands[command];

    this.commands[command] = {
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
    // Remove node environment args
    args = args.slice(2);

    // Print help if no args were provided
    (args.length === 0) && this.showHelp();

    // Expand concatenated flags and convert num strings
    args = convertNumbers(expandCombinedFlags(args));

    // Get the args for each command, e.g. {command: [...args]}
    const commandArgs = parseArgs(args, Object.entries(this.commands));

    // Add args to their respective commands; set as true if no args present
    Object.entries(commandArgs).forEach(([cmd, args]) => {
      if (Array.isArray(args)) {
        this.commands[cmd].args = args.length > 0 ? args : true;
      }
    });

    // Build the default commands
    buildDefaultCmds();
  },


  // SECTION - Help Menu

  /**
   * @description Prints a help menu and exits program process.
   * @param {Object} commands - Program commands.
   * @return {Private} Exit program process.
   */
  showHelp() {
    const programName = basename(process.argv[1], '.js');
    const commandUsage = Object.values(this.commands).map((cmd) => cmd.usage);
    const usageLength = longest(commandUsage).length;

    // Build command usage
    const cmds = Object.values(this.commands)
        .map((command, index) => {
          const usage = commandUsage[index];
          const spaces = Array((usageLength + 5) - usage.length).join(' ');
          const message = `${usage}${spaces}${command.description}`;
          return command.help || message;
        });

    // Build the rest of the menu
    const menu = [
      `${programName[0].toUpperCase() + programName.substr(1)} Help Menu\n`,
      ...cmds,
      `\nUsage: ${programName} <command> [arg]`,
    ];

    menu.forEach((line) => console.log(line));

    return process.exit();
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

        // First arg must be a command
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


// SECTION - Helper Methods

/**
 * @description Build the default commands.
 */
function buildDefaultCmds() {
  if (!Cmds.commands.hasOwnProperty('help')) {
    Cmds.commands.help = {
      description: 'Output the help menu.',
      flags: ['-h', '--help'],
      usage: '-h --help',
      callback: Cmds.showHelp.bind(Cmds),
    };
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
