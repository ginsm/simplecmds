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
  },


  /**
   * @description Contains the rules and their options.
   */
  rules: {},


  /**
    * @description Create a validation rule.
    * @param {String} command - The command name.
    * @param {String} types - String demonstrating the type.
    * @param {Number} amount - Acceptable amount of arguments.
    * @return {private} Validate object for chaining.
    */
  rule: function(command = '', types = '', amount = 0) {
    this.rules[command] = {types, amount};
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
 * @return {Object} this.rules for further consumption.
 * @example { cmdName: [ 'arg1', 'arg2' ] }
 */
  parseArgs: function(args, options) {
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

    // Return the rules object for consumption
    return this.rules;
  },


  /**
    * @description Creates an object for the expected argument types.
    * @param {String} rules - Rules object for the string notation of arg type.
    * @return {Object} that.rules for further consumption.
    */
  parseTypeStrings: function(rules) {
    const ruleKeys = Object.keys(rules);
    const stringsToParse = ruleKeys.map((rule) => rules[rule].types.split(' '));

    const parse = (string) => {
      return string
          /*
            Creates an object with required or optional arg types
            {required: [arg notations], optional: [arg notations]}
          */
          .reduce((prev, argString) => {
            const key = argString.includes('<') && 'required' || 'optional';
            const value = prev[key] ? [...prev[key], argString] : [argString];
            return ({...prev, [key]: value});
          }, {});
    };

    const parsed = stringsToParse.map(parse);
    ruleKeys.forEach((rule, id) => {
      rules[rule].types = parsed[id];
    });

    return this.rules;
  },

  /**
   * @description Validates the rules by type and amount of args.
   * @param {Object} rules - The rules object.
   * @return {Object} Return this.rules for further consumption.
   */
  validate: function(rules) {
    // do validation for each command and add an isValid property (bool)
    /*
      Check types
      Check amount
    */
    // return commands object
    return this.rules;
  },

};

module.exports = Validate;
