// SECTION - Imports
const validate = require('./validate');

const Build = {
  // SECTION - Output Building

  /**
   * Build every command's output object.
   * @param {{}} directive - Contains every command building instructions.
   * @param {{}} args - Object containing commands and their arguments.
   * @return {{}} Args and validity output for each command.
   * @example
   * {
   *  myCommand: {
   *    args: [1, 2],
   *    valid: true,
   *  },
   *  myOtherCommand: {
   *    args: [3, 4],
   *    valid: false,
   *  }
   * }
   */
  buildCommands(directive, args) {
    const issued = Object.entries(args)
        .filter(([_, value]) => Array.isArray(value))
        .map(([cmd, obj]) => Build.build(cmd, directive[cmd], obj));

    const rest = Object.keys(directive)
        .filter((key) => !Object.keys(args).includes(key))
        .map((key) => [key, {args: false, valid: false}]);

    return Object.fromEntries([...issued, ...rest]);
  },


  /**
   * Build an individual command's output object.
   * @param {string} cmd - Command name.
   * @param {{}} directive - Contains command building instructions.
   * @param {{}} args - Object containing all commands arguments.
   * @return {{}} The built command output.
   * @example
   * {
   *  myCommand: {
   *    args: [1, 2],
   *    valid: true,
   *  }
   * }
   */
  build(cmd, directive, args) {
    args = Build.enforceArgumentAmount(directive, args);
    return [cmd, {args,
      valid: directive.hasOwnProperty('rules') && directive.rules ?
          validate({
            args: args.length ? args : [true],
            rules: directive.rules.split(' '),
          }, cmd) : true,
    }];
  },


  // SECTION - Handle Callbacks

  /**
   * Issue each command's callback function.
   * @param {{}} directive - Contains command building instructions.
   * @param {{}} commands - The end-user command object.
   */
  issueCallbacks(directive, commands) {
    Object.entries(commands).forEach(([cmd, {args, valid}]) => {
      if (args) {
        const command = directive[cmd];
        if (command.callback) {
          command.callback(args, valid, commands);
        }
      }
    });
  },


  // SECTION - Helpers

  /**
   * Enforces the specified argument amount; discarding any over the limit.
   * @param {{}} obj - The command's directive object.
   * @param {[]} args - The command's arguments.
   * @return {[]} An array containing no more than the amount.
   */
  enforceArgumentAmount(obj, args) {
    if (obj.amount) {
      return (args.length > obj.amount) ? args.slice(0, obj.amount) : args;
    }
    return args;
  },
};

module.exports = Build;
