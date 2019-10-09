/*
  TODO -
  [x] Allow for various prefixes .create, -create, *create, so on.
  [ ] .exec() function that executes a shell cmd on command being issued
  [x] Concatenated short flags
  [x] Boolean commands
  [x] Fix not iterable lastBuilt err
  [ ] Look at parseFlag's validFlag function again.
  [ ] Implement type checking
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
    // Parse the flags and sort them by length
    const flags = parseFlags(flagString);
    const command = camelCase(flags[0]);

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


  // SECTION - arguments

  /**
   * @description Parse program args and add them to their command.
   * @param {[]} args - Expects process.argv.
   */
  parse(args) {
    // Print help if no args were provided
    const noArgs = args.length === 0;
    if (noArgs) console.log('placeholder help menu');

    // Remove node environment args, expand concatenated flags, & convert nums
    args = convertNumbers(expandCombinedFlags(args.slice(2)));

    // Generate an object containing flags & their respective cmd name
    // e.g. {'-c,--create': 'create'}
    const commandNames = this.cmds().reduce((prev, cmd) => {
      const flags = this.commands[cmd].flags;
      return ({...prev, [flags]: cmd});
    }, {});

    // Generate an object of command names and args
    // e.g. {*cmd: [...args]}
    const parsedArgs = args
        .reduce((prev, arg, id) => {
          // Resolve whether it's a command or not
          const cmdFlag = Object.keys(commandNames).filter((cmd) =>
            cmd.includes(arg));
          const cmdName = commandNames[cmdFlag];
          const isCommand = cmdFlag.length;

          // First arg must be a command
          const firstArgNotCommand = id == 0 && !isCommand;
          if (firstArgNotCommand) error(3);

          // Used for key/value building
          const lastBuilt = Object.keys(prev).slice(-1);
          const arrExists = prev.hasOwnProperty(cmdName) && [...prev[cmdName]];

          // Object construction
          const key = isCommand && cmdName || lastBuilt;
          const value = isCommand ? arrExists || [] : [...prev[lastBuilt], arg];
          return ({...prev, [key]: value});
        }, {});

    // Add args to their respective commands; set as true if no args present
    Object.entries(parsedArgs).forEach(([cmd, args]) => {
      this.commands[cmd].args = args.length > 0 ? args : true;
    });
  },
};

module.exports = Cmds;


// SECTION - Helpers

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

  // Make sure every flag is valid & sort it by length
  const sortByLength = (a, b) => b.length - a.length;
  return flags.every(flagValid) && flags.sort(sortByLength) || error(1, flags);
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
 * @description Converts any stringed numbers to a number.
 * @param {*} input - Value(s) to be converted.
 * @return {*} - Returns the input after attempting conversion.
 */
function convertNumbers(input) {
  const convertNum = (arg) => /^\d+$/.test(arg) && Number(arg) || arg;
  const isArray = Array.isArray(input);
  return isArray && input.map(convertNum) || convertNum(input);
}


/**
 * @description - Expands combined short flags.
 * @param {[]} arr - Argument array.
 * @return {[]} Array with expanded short flags at the beginning.
 */
function expandCombinedFlags(arr) {
  const exp = {
    concatenatedFlags: /(?<!\S)\W\w{2,}/,
    inbetween: /(?<!\W)(?=\w)/g,
    byFlag: /(?=\W)/g,
  };

  // Expand any concatenated flags into short flags (in place)
  const expanded = flatten(arr.map((arg) => {
    return exp.concatenatedFlags.test(arg) ?
      arg.replace(exp.inbetween, '-').split(exp.byFlag) : arg;
  }));

  // Removing duplicates so there's less to iterate over
  return [...new Set(expanded)];
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
