const Validate = {
  /**
   * @description Parse commander.rawArgs to get the commands and their arguments.
   * @param {Object} cmdr - Expects commander's object.
   */
  parse: function(cmdr) {
    const options = Object.keys(cmdr.opts());
    const rawArgs = cmdr.rawArgs.slice(2);

    // Populate the commands property
    parseArgs(rawArgs, options, this)
        .then(console.log)
        .catch((err) => console.log(err));
  },

  /**
   * @description Contains the rules and their options.
   */
  rules: {},

  /**
    * @description Create a validation rule.
    * @param {String} command - The command name.
    * @param {Array} fixed - Fixed argument types.
    * @param {Array} loose - Loose argument types.
    * @param {Number} amount - Acceptable amount of arguments.
    * @return {private} Validate object for chaining.
    */
  rule: function(command = '', fixed = false, loose = false, amount = 0) {
    this.rules[command] = {fixed, loose, amount};
    return this;
  },

  validate: (cmd) => {
    // do validation for each command and add an isValid property (bool)
    // return commands object
  },

  finalize: (commands) => {
    // add a property for each command to Validate containing the
    // command name, argument, and isValid property.
  },

  normalize: (name) => {
    // look at how commander normalizes their commands
  },

};

module.exports = Validate;

/**
 * @description Creates an object containing the command and it's arguments.
 * @param {Array} args - User arguments.
 * @param {Object} options - Commander.opts() keys.
 * @param {Object} that - 'this' context of Validate object.
 * @return {Object} Generated commands object.
 * @example { cmdName: [ 'arg1', 'arg2' ] }
 */
async function parseArgs(args, options, that) {
  /*
    map: Creates an array of booleans containing whether an argument is
    a program command or not.
    reduce: Use the boolean array to generate an object such as:
      { command: [args] }
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
  const rules = Object.keys(that.rules);
  Object.keys(commands)
      .filter((cmd) => rules.includes(cmd))
      .forEach(((cmd) => {
        that.rules[cmd].args = commands[cmd];
      }));

  // Return the rules object for consumption
  return that.rules;
}
