const Cmds = {
  // ---------------------- Command Creation ---------------------- //

  /**
    * @description Contains the commands.
    */
  commands: {},


  /**
     * @return {string[]} Existing command names.
     */
  cmds: function() {
    const commandNames = Object.keys(this.commands);
    return commandNames;
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
    const camelCaseName = camelCase(flags[0]);

    // Add command to the commands object
    this.commands[camelCaseName] = {
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


  // ------------------------- Arguments ------------------------- //

  /**
    * @description Parse program args and add them to their command.
    * @param {[]} args - Expects process.argv.
    */
  parse: function(args) {
    // Remove node environment args
    args = args.slice(2);

    // Generate an object containing flags & their respective cmd name
    // e.g. {'-c,--create': 'create'}
    const commandNames = this.cmds().reduce((prev, cmd) => {
      const flags = this.commands[cmd].flags;
      return ({...prev, [flags]: cmd});
    }, {});

    // Generate an object of command names and args
    // e.g. {*cmd: [...args]}
    const parsedArgs = args.reduce((prev, arg) => {
      // Resolve whether it's a command or not
      const command = Object.keys(commandNames).filter((cmd) =>
        cmd.includes(arg));
      const cmdName = commandNames[command];
      const isCommand = command.length;

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
    const noArgs = parsedEntries.length === 0;
    if (noArgs) console.log('placeholder help menu');

    // Add args to their respective commands
    parsedEntries.forEach((entry) => {
      const [cmd, args] = entry;
      this.commands[cmd].args = args;
    });
  },
};


console.time('Build time');
Cmds
    .command('-c, --create <text>', 'create a task', console.log)
    .rule('<number,string>', 1)
    .command('-n, --no-rule', 'No rule contained')
    .command('-d, --delete <id> [id]', 'delete a task')
    .rule('<number> [number]', 1)
    .parse(process.argv);
console.timeEnd('Build time');

console.log(Cmds.commands);


// -------------------------- Helpers -------------------------- //

// ! Redo valid flag fn in this function.
/**
  * @description Parses and validates the flags for consumption.
  * @param {string} flags - Command flags.
  * @return {private} Array of possible command names.
  */
function parseFlags(flags) {
  // Find all valid flags in the provided string
  const flagRegex = /(?<!([<\w>\[\]]))[\w-]+/g;
  flags = flags.match(flagRegex).slice(0, 2) || error(0, flags);

  // Validate a flag
  const flagValid = (flag) => {
    const isShortFlag = flag.length === 2 && /-[\w]/.test(flag);
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
  const camelCaseString = (word, id) => !id && word.toLowerCase() ||
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
  ];

  // Log error and exit
  console.error(`[Error] ${errors[code]}`);
  process.exit();
}
