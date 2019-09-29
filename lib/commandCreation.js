const helpers = require('./helper');

const CommandCreation = {
  /**
   * @description Contains the commands.
   */
  commands: {},


  /**
   * @description Gets the last command in commands object.
   * @return {private} Object containing command name and properties
   */
  get lastCommand() {
    // Retrieve last command in commands object & return it
    const command = Object.keys(this.commands).slice(-1)[0];
    return {name: command, object: this.commands[command]};
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
    const names = this.parseFlags(flags).sort((a, b) => {
      return b.length - a.length;
    });

    // Add command to the commands object
    this.commands[this.normalize(names[0])] = {
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
    const lastCommand = this.lastCommand;

    // Add rule to last command's object
    this.commands[lastCommand.name] = {
      ...lastCommand.object,
      notation: notation.split(' '),
      amount,
    };

    return this;
  },


  /**
   * @description - Parses and validates the flags for consumption.
   * @param {string} flags - Command flags.
   * @return {private} Array of possible command names.
   */
  parseFlags: function(flags) {
    // Build matches and check amount
    const flagRegex = /(?<!([<\w>\[\]]))[\w-]+/g;
    flags = flags.match(flagRegex).slice(0, 2) || this.error(0, flags);

    // Validate flags
    const valid = (flag) => {
      return flag.length === 2 && /-[\w]/.test(flag) || flag.length >= 4;
    };

    return flags.every(valid) && flags || this.error(1, flags);
  },

  ...helpers,
};


// Using this for testing; will remove.
CommandCreation
    .command('-c, --create: <text>', 'create a task')
    .rule('<number,string>', 1)
    .command('-n, --no-rule', 'No rule contained')
    .command('-d, --delete: <id> [id]', 'delete a task')
    .rule('<number> [number]', 1);

console.log(CommandCreation.commands);
