const typeCheck = require('./typecheck');
const error = require('./errors');

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
    return (matches || error('CommandBuild', command)).slice(0, 2);
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
   * @param {*} args - The processed arguments.
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
   * @param {string} cmd - Command name.
   * @param {{}} obj - Builder object.
   * @param {{}} args - Object containing command args.
   * @return {{}} The built command.
   * @example
   * {
   *  myCommand: {
   *    args: [1, 2],
   *    valid: true,
   *  }
   * }
   */
  build(cmd, obj, args) {
    if (args.hasOwnProperty(cmd)) {
      const cmdArgs = obj.amount ? args[cmd].slice(0, obj.amount) : args[cmd];

      const commandObject = {
        [cmd]: {
          args: cmdArgs,
          valid: obj.hasOwnProperty('rule') ?
          typeCheck({
            args: cmdArgs.length ? cmdArgs : [true],
            rule: obj.rule,
            amount: obj.amount || 0,
          }) : true,
        },
      };

      Object.assign(this, commandObject);
      return commandObject;
    }

    const commandObject = {[cmd]: {args: undefined, valid: false}};
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
};

module.exports = Build;
