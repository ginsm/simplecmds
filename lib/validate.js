// ? Consideration
/* [1]:
  Possibly turn Validate into a wrapper for Commander? Chain option and rule to
  create the commands; this eliminates needing to enter the cmd name in rule.
*/


const Validate = {
  /**
    * @description Parses args and the arg type notations then validates them.
    * @param {Object} cmdr - Expects commander's object.
    */
  parse: function(cmdr) {
    const options = Object.keys(cmdr.opts());
    const rawArgs = cmdr.rawArgs.slice(2);

    // Begin parsing
    this.parseArgs(rawArgs, options);
    this.parseTypeStrings(this.rules);
    this.validate(this.rules);
  },


  /**
    * @description Contains the rules and their options.
    */
  rules: {},


  /**
    * @description Create a validation rule.
    * @param {String} command - The command name.
    * @param {String} types - String notation of the arg types.
    * @param {Number} amount - Acceptable amount of arguments.
    * @return {private} Validate object for chaining.
    */
  rule: function(command = '', types = '', amount = 0) {
    this.rules[command] = {command, types, amount};
    return this;
  },


  finalize: (commands) => {
    // add a property for each command to Validate containing the
    // command name, argument, and isValid property.
  },


  normalize: (name) => {
    // look at how commander normalizes their commands
  },


  /**
    * @description Creates an object containing the command and it's arguments.
    * @param {Array} args - User arguments.
    * @param {Object} options - Commander.opts() keys.
    * @example { cmdName: [ 'arg1', 'arg2' ] }
    */
  parseArgs: function(args, options) {
    // Convert any args that are stringed numbers into numbers.
    args = this.convertNumbers(args);

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
    * @description Creates an object for the expected argument types.
    * @param {String} rules - Rules object for the string notation of arg type.
    */
  parseTypeStrings: function(rules) {
    const ruleKeys = Object.keys(rules);
    const stringsToParse = ruleKeys.map((rule) => rules[rule].types.split(' '));

    /**
      * @description Creates an object with required or optional type notations.
      * @param {*} string - Arg type notations string.
      * @return {Object} {required: [arg notations], optional: [arg notations]}
      */
    const parse = (string) => {
      return string
          .reduce((prev, argString) => {
            const reqRegex = /[<\w,]+>/g;
            const key = reqRegex.test(argString) && 'required' || 'optional';
            const value = prev[key] ? [...prev[key], argString] : [argString];
            return ({...prev, [key]: value});
          }, {});
    };

    // Add the generated object to it's respective rule
    const parsed = stringsToParse.map(parse);
    ruleKeys.forEach((rule, id) => {
      rules[rule].types = parsed[id];
    });
  },

  /**
    * @description Validates the given rule by type and amount of args.
    * @param {Object} rules - Expects this.rules.
    */
  validate: function(rules) {
    Object.keys(rules).forEach((rule) => {
      const {command, types, amount, args} = rules[rule];

      // Amount validation
      const requiredAmount = args.length >= types.required.length;
      const appropriateAmount = args.length <= amount;
      const validAmount = requiredAmount && appropriateAmount;

      // Type validation
      const argTypes = args.map((arg) => typeof arg);
      // I need a way to check the required first then optional.

      if (validAmount) {

      }
    });
  },

  /**
    * @description Converts stringed numbers to a number.
    * @param {*} input - Value to be converted.
    * @return {*} - Returns any input that might be a number.
    */
  convertNumbers: (input) => {
    const isArray = Array.isArray(input);
    const convert = (arg) => /^\d+$/.test(arg) && Number(arg) || arg;
    return isArray && input.map(convert) || convert(input);
  },
};

module.exports = Validate;
