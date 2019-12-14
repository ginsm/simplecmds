// SECTION - Imports
const error = require('./error');


/**
 * Parses the commands object and checks for any errors.
 */
const BuildTools = {
  /**
   * Initiates the build tools and ensures there are no user errors.
   * @param {[]} entries - Entries for each command directive.
   * @param {{}} that - `this` context of simplecmds.js.
   * @memberof buildtools.js
   */
  init(entries = [], that) {
    BuildTools.noConflictingAliases(entries);
    BuildTools.validateRules(entries);
    entries = entries.map(this.requiredAmountMet);
    Object.assign(BuildTools, {
      directive: {
        ...Object.fromEntries(entries),
        ...this.addDefaultCommands(that),
      },
    });
  },

  /**
   * Search the directive using an alias for a specific command.
   * @param {string} alias - Search parameter.
   * @return {Object} - The specific command's directive object.
   * @memberof buildtools.js
   */
  searchDirective(alias) {
    const dashedAlias = alias.length > 1 ? `--${alias}` : `-${alias}`;
    return Object.values(this.directive).find((obj) =>
      obj.alias.includes(dashedAlias)) || this.directive[alias] ||
      error('NotFound', `Could not find a command with the alias '${alias}'.`);
  },


  // SECTION - Default Commands
  /**
   * Add the default commands to the Builder object.
   * @param {{}} that - `this` context of simplecmds.js.
   * @return {{}} An object containing the default commands.
   */
  addDefaultCommands(that) {
    const alias = this.defaultAliases();
    return {
      help: {
        description: 'Output help menu.',
        alias: [alias.help, '--help'],
        usage: `${alias.help} --help`,
        callback: function({args: [command]}) {
          that.help.call(that, {exit: true, command});
        },
        rules: '[number,string]',
        amount: 1,
      },
      vers: {
        description: 'Output version information.',
        alias: [alias.version, '--version'],
        usage: `${alias.version} --version`,
        callback: () => console.log(that.version),
      },
      ...(that.debug && {debug: {
        description: 'Output debug information.',
        alias: [alias.debug, '--debug'],
        usage: `${alias.debug} --debug`,
        callback: () => console.log(this.directive, that.cmds),
      }}),
    };
  },


  // SECTION - Error checking
  /**
   * Ensure there are no conflicting aliases.
   * @param {[]} entries - Entries for each command directive.
   */
  noConflictingAliases(entries = []) {
    const aliases = BuildTools.allAliases(entries);
    Object.assign(BuildTools, {aliases});

    // ensure there are no duplicate aliases
    (new Set(aliases)).size === aliases.length || error('Creation',
        'You have conflicting (duplicate) aliases in your commands.',
    );
  },


  /**
   * Ensure every command's rules use valid syntax.
   * @param {[]} entries - Entries for each command directive.
   */
  validateRules(entries = []) {
    const whitespaceInRule = /<\w*\s.*>|\[\w*\s.*\]/;
    const optionalBeforeRequired = '] <';
    entries.forEach((cmd, {rules}) => {
      if (rules) {
        cmd = `${cmd}.rules`;
        // ensure there are no whitespaces within a rule bracket
        (!whitespaceInRule.test(rules) || error('Creation',
            `${cmd} cannot contain whitespace inside of the brackets.`,
        ));
        // ensure there are no optional arguments before required ones
        (rules.includes(optionalBeforeRequired) && error('Creation',
            `${cmd} cannot contain an optional rule before a required one.`,
        ));
      }
    });
  },


  /**
   * Ensure that the amount accounts for the required amount of arguments.
   * @param {string} cmd - The command's property name.
   * @param {{}} obj - The command's options object.
   * @return {{}} Resolved amount.
   */
  requiredAmountMet([cmd, obj]) {
    if (obj.amount && obj.rules) {
      const requiredAmount = obj.rules.split(' ')
          .filter((rule) => rule[0] == '<').length;

      return [cmd, {...obj,
        amount: requiredAmount > obj.amount ? requiredAmount : obj.amount,
      }];
    }
    return [cmd, obj];
  },


  // SECTION - Helpers
  /**
   * Handles default command aliases; capitalizing upon any conflicts.
   * @return {{}} Non-conflicting aliases for default commands.
   */
  defaultAliases() {
    const resolve = (alias) => {
      return this.aliases.includes(alias) ? alias.toUpperCase() : alias;
    };
    return ({
      help: resolve('-h'),
      version: resolve('-v'),
      debug: resolve('-d'),
    });
  },

  /**
   * Get an array of all the aliases.
   * @param {[]} entries - Entries for each command directive.
   * @return {[]} Array containing all command aliases.
   */
  allAliases(entries = []) {
    return entries.reduce((prev, [_, command]) =>
      ([...prev, ...command.alias]), []);
  },
};

module.exports = BuildTools;
