// SECTION - Imports
const validate = require('./validate');

const Build = {
  // SECTION - Output Building

  /**
   * Build each command's object.
   * @param {{}} Builder - Contains command building instructions.
   * @param {*} args - Object containing commands and their arguments.
   * @return {{}} Args and validity for each command.
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
  buildCommands(Builder, args) {
    const commands = {};
    for (const cmd in Builder) {
      if (Builder[cmd]) {
        Object.assign(commands,
            Build.build.call(this, cmd, Builder[cmd], args),
        );
      }
    }
    return commands;
  },


  /**
   * Builds individual command objects.
   * @param {string} cmd - Command name.
   * @param {{}} Builder - Command's Builder object.
   * @param {{}} args - Object containing all commands arguments.
   * @return {{}} The built command.
   * @example
   * {
   *  myCommand: {
   *    args: [1, 2],
   *    valid: true,
   *  }
   * }
   */
  build(cmd, Builder, args) {
    if (args.hasOwnProperty(cmd)) {
      const cmdArgs = Build.enforceArgumentAmount(Builder, args[cmd]);

      const commandObject = {
        [cmd]: {
          args: cmdArgs,
          valid: Builder.hasOwnProperty('rules') && Builder.rules ?
          validate({
            args: cmdArgs.length ? cmdArgs : [true],
            rules: Builder.rules.split(' '),
          }, cmd) : true,
        },
      };

      Object.assign(this, commandObject);
      return commandObject;
    }

    // This is here as an edge case where someone tries to validate a command
    // that has not been issued by the user.
    const commandObject = {[cmd]: {args: undefined, valid: false}};
    Object.assign(this, commandObject);
    return commandObject;
  },


  // SECTION - Handle Callbacks

  /**
   * Issue each command's callback function.
   * @param {{}} Builder - Contains command building instructions.
   * @param {{}} commands - The end-user command object.
   */
  issueCallbacks(Builder, commands) {
    Object.entries(Builder).forEach(([cmd, obj]) => {
      if (commands[cmd] && commands[cmd].args) {
        const {args, valid} = commands[cmd];
        if (obj.callback) {
          obj.callback(args, valid, commands);
        }
      }
    });
  },


  // SECTION - Helpers

  /**
   * Enforces the specified argument amount; discarding any over the limit.
   * @param {{}} obj - The command's Builder object.
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
