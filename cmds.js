/*
  TODO -
  [x] Allow for various prefixes .create, -create, *create, so on.
  [ ] .exec() which executes a shell cmd on command being issued
  [x] Concatenated short flags
  [x] Boolean commands
  [x] Fix not iterable lastBuilt err
      - Temporary bandaid fix created.
  [ ] Add a separate object for generating the main object.
        This would build the current object and all of it's properties
        and then add to the main object the cmd objects as such:
          {
            args: [...args],
            isValid: boolean
          }
        The only necessary functions in Cmds would be the creation of the
        command, rule, and parse functions. Potentially exec and any other
        related ones.

        Once it's complete, the generation object could be deleted from the
        module to free up memory.
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
  cmds: function() {
    return Object.keys(this.commands);
  },


  /**
     * @description Create a command.
     * @param {string} flagString - Usable command flags.
     * @param {string} description - Description of the command.
     * @param {Object} callback - Callback to be used with function
     * @return {private} 'this' for chaining.
     */
  command: function(flagString = '', description = '', callback = false) {
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
  rule: function(notation = '', amount = 0) {
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
  parse: function(args) {
    // Remove node environment args and expand concatenated short flags
    args = expandCombinedFlags(args.slice(2));

    // Generate an object containing flags & their respective cmd name
    // e.g. {'-c,--create': 'create'}
    const commandNames = this.cmds().reduce((prev, cmd) => {
      const flags = this.commands[cmd].flags;
      return ({...prev, [flags]: cmd});
    }, {});

    // Generate an object of command names and args
    // e.g. {*cmd: [...args]}
    const parsedArgs = args
        // Used to generate the args per command
        .reduce((prev, arg, id) => {
          // Resolve whether it's a command or not
          const cmdFlag = Object.keys(commandNames).filter((cmd) =>
            cmd.includes(arg));
          const cmdName = commandNames[cmdFlag];
          const isCommand = cmdFlag.length;

          if (id == 0 && !isCommand) error(4);
          // Used for key/value building
          const lastBuilt = Object.keys(prev).slice(-1);
          const arrExists = prev.hasOwnProperty(cmdName) && [...prev[cmdName]];

          // Build the object
          const key = isCommand && cmdName || lastBuilt;
          const value = isCommand ? arrExists || [] : [...prev[lastBuilt], arg];
          return ({...prev, [key]: convertNumbers(value)});
        }, {});

    // Get the entries
    const parsedEntries = Object.entries(parsedArgs);

    // Print help if no args were provided
    const noArgs = parsedEntries.length == 0;
    if (noArgs) console.log('placeholder help menu');

    // Add args to their respective commands
    parsedEntries.forEach(([cmd, args]) => {
      this.commands[cmd].args = args.length > 0 ? args : true;
    });
  },
};


console.time('Build time');
Cmds
    .command('-c --create <text>', 'create a task')
    .rule('<number,string>', 1)
    .command('-n --no-rule', 'No rule contained')
    .command('-d --delete <id> [id]', 'delete a task')
    .rule('<number> [number]', 1)
    .parse(process.argv);
console.timeEnd('Build time');

console.log(Cmds.commands);


// SECTION - Helpers

// ! Redo valid flag fn in this function.
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

  // Find concatenated short flags and expand them into single flags
  const expanded = arr.filter((item) => exp.concatenatedFlags.test(item))
      .map((flags) => flags.replace(exp.inbetween, '-').split(exp.byFlag));

  // Add short flags to the beginning of arr and filter out concatenated version
  return [...new Set(Array.prototype.concat.apply([], expanded))]
      .concat(arr).filter((arg) => !exp.concatenatedFlags.test(arg));
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
    `Sorry, no commands were provided.`,
    `You cannot use two flags referencing the same command: '${value}'.`,
    `No valid commands were provided.`,
  ];

  // Log error and exit
  console.error(`[Error] ${errors[code]}`);
  process.exit();
}
