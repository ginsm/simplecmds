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
     * @param {string} flags - Usable command flags.
     * @param {string} description - Description of the command.
     * @param {Object} callback - Callback to be used with function
     * @return {private} 'this' for chaining.
     */
  command: function(flags = '', description = '', callback = false) {
    // Parse the flags and sort them by length
    const names = parseFlags(flags);
    const camelCaseName = normalize(names[0]);

    // Add command to the commands object
    this.commands[camelCaseName] = {
      description,
      names,
      usage: flags,
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
    const name = this.cmds().slice(-1)[0];
    const object = this.commands[name];

    // Add rule to last command's object
    this.commands[name] = {
      ...object,
      notation: notation.split(' '),
      amount,
    };

    return this;
  },


  // ------------------------- Arguments ------------------------- //

  /**
    * @description Parse program args and type check them.
    * @param {[]} args - Expects process.argv.
    */
  parse: function(args) {
    // Remove node environment args
    args = args.slice(2);

    // Generate an object containing flags & their respective cmd name
    // e.g. {'-c,--create': 'create'}
    const commandNames = this.cmds().reduce((prev, cmd) => {
      const names = this.commands[cmd].names;
      return ({...prev, [names]: cmd});
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
      const cmdExists = prev.hasOwnProperty(cmdName) && [...prev[cmdName]];
      const lastBuilt = Object.keys(prev).slice(-1);

      // Build the object
      const key = isCommand && cmdName || lastBuilt;
      const value = isCommand ? cmdExists || [] : [...prev[lastBuilt], arg];
      return ({...prev, [key]: value});
    }, {});

    // Get the entries
    const parsedEntries = Object.entries(parsedArgs);

    // Print help if no args were provided
    const noArgs = parsedEntries.length === 0;
    if (noArgs) console.log('placeholder help menu');

    parsedEntries.forEach((entry) => {
      this.commands[entry[0]].args = entry[1];
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

console.log(Cmds);


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
  const validFlag = (flag) => {
    const isShortFlag = flag.length === 2 && /-[\w]/.test(flag);
    const isLongFlag = flag.length >= 4;
    return isShortFlag || isLongFlag;
  };

  // Make sure every flag is valid & sort it by length
  const sortByLength = (a, b) => b.length - a.length;
  return flags.every(validFlag) && flags.sort(sortByLength) || error(1, flags);
}


/**
  * @description Remove any dashes and camel case a string.
  * @param {string} string - String to normalize.
  * @return {string} Normalized string.
  */
function normalize(string) {
  const camelCaseString = (text, id) => {
    const firstWord = !id && text;
    const uppercaseFirstLetter = text[0].toUpperCase() + text.slice(1);
    return firstWord || uppercaseFirstLetter;
  };
  // Replace any -, trim trailing whitespace and split by remaining spaces
  return string.replace(/-/g, ' ').trim().split(' ')
      .map(camelCaseString).join('');
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
  * @description Compares two arrays and finds matching values.
  * @param {[]} superset - First array
  * @param {[]} subset - Second array
  * @return {[]} Array of matching values.
  */
function sharedValues(superset, subset) {
  const valueInSuper = (value) => superset.indexOf(value) >= 0;
  return subset.filter(valueInSuper);
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
