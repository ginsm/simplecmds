const validate = require('./validate');
const error = require('./errors');
const {validRule} = require('./helper');

const Build = {
  /**
   * Find every valid alias in an usage string.
   * @param {string} usage - Contains command aliases.
   * @param {string} command - The
   * @return {private} Array of found aliases (up to 2).
   * @example
   * generateAlias('-m --my-command [number]', 'myCommand');
   * // output -> ['-m', '--my-command']
   */
  generateAlias(usage, command) {
    const aliases = /(?<!\S)(-\w\b|--[\w-]{3,}|(?=[^-])[\w-]{2,})/g;
    const matches = usage.match(aliases);
    return (matches || error('CommandUsage',
        `No valid aliases found in ${command}.usage string.`)).slice(0, 2);
  },


  /**
   * Add the default commands to the Builder object.
   * @param {{}} Builder - Contains command building instructions.
   */
  addDefaultCommands(Builder) {
    const alias = {
      help: Build.aliasConflict(Builder, '-h'),
      debug: Build.aliasConflict(Builder, '-d'),
      version: Build.aliasConflict(Builder, '-v'),
    };
    Object.assign(Builder, {
      help: {
        description: 'Output help menu.',
        alias: [alias.help, '--help'],
        usage: `${alias.help} --help`,
        callback: this.showHelp.bind(this),
      },
      vers: {
        description: 'Output version information.',
        alias: [alias.version, '--version'],
        usage: `${alias.version} --version`,
        callback: () => console.log(this.version),
      },
      ...(this.debug && {debug: {
        description: 'Output debug information.',
        alias: [alias.debug, '--debug'],
        usage: `${alias.debug} --debug`,
        callback: () => console.log(Builder),
      }}),
    });
  },


  /**
   * Handle conflicting aliases.
   * @param {{}} Builder - Contains command building instructions.
   * @param {string} alias - Alias to look up.
   * @return {boolean} A non-conflicting alias.
   * @example
   * // another command uses -h
   * aliasConflict('-h');
   * // output -> '-H'
   */
  aliasConflict(Builder, alias) {
    return Object.values(Builder).filter((command) => {
      return command.alias.includes(alias);
    }).length > 0 && alias.toUpperCase() || alias;
  },


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
            Build.build.call(this, cmd, Builder[cmd], args)
        );
      }
    }
    return commands;
  },


  /**
   * Builds individual command objects.
   * @param {string} cmdName - Command name.
   * @param {{}} builderObj - Command's builder object.
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
  build(cmdName, builderObj, args) {
    if (args.hasOwnProperty(cmdName)) {
      const cmdArgs = Build.enforceArgumentAmount(builderObj, args[cmdName]);

      const commandObject = {
        [cmdName]: {
          args: cmdArgs,
          valid: builderObj.hasOwnProperty('rule') ?
          validate({
            args: cmdArgs.length ? cmdArgs : [true],
            rule: validRule(builderObj.rule).split(' '),
          }, cmdName) : true,
        },
      };

      Object.assign(this, commandObject);
      return commandObject;
    }

    if (builderObj.hasOwnProperty('rule')) {
      validRule(builderObj.rule, cmdName);
    }

    // This is here as an edge case where someone tries to validate a command
    // that has not been issued by the user.
    const commandObject = {[cmdName]: {args: undefined, valid: false}};
    Object.assign(this, commandObject);
    return commandObject;
  },


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

  /**
   * Enforces the specified argument amount; discarding any over the limit.
   * @param {{}} obj - The command's builder object.
   * @param {[]} args - The command's arguments.
   * @return {[]} An array containing no more than the amount.
   */
  enforceArgumentAmount(obj, args) {
    if (obj.amount) {
      if (obj.rule) {
        const requiredAmount = obj.rule.split(' ')
            .filter((rule) => rule[0] == '<').length;

        Object.assign(obj, {
          amount: (requiredAmount > obj.amount) ? requiredAmount : obj.amount,
        });
      }

      return (args.length > obj.amount) ? args.slice(0, obj.amount) : args;
    }
    return args;
  },
};

module.exports = Build;
