// Todo
// [ ] Handle no command or argument calls.
// [ ] No argument but command present? Boolean value.
// [ ] Convert Validate into a wrapper for Commander or create a similar
//     help command.


const Validate = {
  /**
    * @description Parses args and the arg type notations then validates them.
    * @param {Object} cmdr - Expects commander's object.
    */
  parse: function(cmdr) {
    const options = Object.keys(cmdr.opts());
    const rawArgs = cmdr.rawArgs.slice(2);

    // parseArgs then validate them
    this.parseArgs(rawArgs, options);
    this.validateArgs(this.rules);
  },


  /**
    * @description Contains the rules and their options.
    */
  rules: {},


  /**
    * @description Create a validation rule.
    * @param {string} command - The command name.
    * @param {string} types - String notation of the arg types.
    * @param {number} amount - Acceptable amount of arguments.
    * @return {private} Validate object for chaining.
    */
  rule: function(command = '', types = '', amount = 0) {
    this.rules[command] = {command, types, amount};
    return this;
  },


  /**
    * @description Parse the arguments and create a rule property for the args.
    * @param {*[]} args - User arguments.
    * @param {Object} options - Commander.opts() keys.
    * @example { cmdName: [ 'arg1', 'arg2' ] }
    */
  parseArgs: function(args, options) {
    // Convert any args that are stringed numbers into numbers.
    args = this.convertNumbers(args);


    // ! Revamp this: Exit upon no commands
    process.on('exit', (code) => code === 1 &&
          console.log('Invalid command or arguments.'));
    if (1 > args.length) {
      console.log(args.length);
      process.exit(1);
    };


    /*
      map: Creates an array of booleans containing whether an argument is
      a program command or not.
      reduce: Use the boolean array to generate an object such as:
      {command: [args]}
    */
    const commands = args
        .map((arg) => options.includes(arg))
        .reduce((prev, curr, id) => {
          const [lastKey] = Object.keys(prev).slice(-1);
          // Create new property with arg name or use lastKey
          const key = curr ? args[id] : lastKey;
          // Create a new array or insert arg into lastKey's array
          const value = curr ? [] : [...prev[lastKey], args[id]];
          return ({...prev, [key]: value});
        }, {});


    /*
      filter: Filter out commands that do not have a ruleset.
      forEach: Update the rules object to contain args for each command.
    */
    const rules = Object.keys(this.rules);
    Object.keys(commands)
        .filter((cmd) => rules.includes(cmd))
        .forEach(((cmd) => {
          this.rules[cmd].args = commands[cmd];
        }));
  },


  /**
    * @description Validates each rule by type and amount of args.
    * @param {Object} rules - Expects this.rules object.
    */
  validateArgs: function(rules) {
    Object.keys(rules).forEach((rule) => {
      if (!rules[rule].hasOwnProperty('args')) return;
      const {command, types, amount, args} = rules[rule];

      // Tries a regex match and returns an empty array upon null return
      const nullCheck = (match) => match ? match : [];

      // ? Amount validation
      const requiredAmount = nullCheck(types.match(/[<\w,]+>/g)).length;
      const appropriateAmount = args.length <= amount;
      const validArgAmount = appropriateAmount && args.length >= requiredAmount;


      // ? Type validation
      const notations = types.split(' ');
      const optional = nullCheck(types.match(/[\[\w,]+]/g)).length;
      const lastNotation = notations.slice(-1)[0];

      // Get the type of each arg
      const argTypes = args.map((arg) => typeof arg);

      // Ensure every type is correct
      const validArgTypes = args
          .map((_, id) => {
            // Checks if a notation includes the arg type
            const valid = (notation) => notation.includes(argTypes[id]);

            // conditions
            const idRequired = (id <= requiredAmount - 1);
            const reachedEnd = (id > notations.length - 1);
            const notation = notations[id];

            return idRequired ? valid(notation) :
              optional && (reachedEnd ? valid(lastNotation) : valid(notation));
          })
          .every((isValid) => isValid);

      // Log for testing
      console.log(validArgAmount && validArgTypes);
    });
  },

  /**
    * @description Converts any stringed numbers to a number.
    * @param {*} input - Value(s) to be converted.
    * @return {*} - Returns the input after attempting conversion.
    */
  convertNumbers: (input) => {
    const convert = (arg) => /^\d+$/.test(arg) && Number(arg) || arg;
    const isArray = Array.isArray(input);
    return isArray && input.map(convert) || convert(input);
  },

  normalize: (name) => {
    // look at how commander normalizes their commands
  },
};

module.exports = Validate;
