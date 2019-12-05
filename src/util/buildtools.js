/**
 * Parses the commands object and checks for any errors.
 */
const BuildTools = {
  /**
   * Initiates the build tools and ensures there are no user errors.
   * @param {[]} entries - Entries for each command.
   * @param {{}} that - `this` context of simplecmds.js.
   */
  init(entries = [], that) {
    BuildTools.noConflictingAliases(entries);
    BuildTools.validateRules(entries);
    const defaults = this.addDefaultCommands(that);
    Object.assign(BuildTools, {
      commands: {
        ...Object.fromEntries(entries),
        ...defaults,
      },
    });
  },

  // SECTION - Default Commands
  /**
   * Add the default commands to the Builder object.
   * @param {{}} that - `this` context of simplecmds.js.
   * @return {{}} An object containing the default commands.
   */
  addDefaultCommands(that) {
    const alias = this.defaultShortAlias();
    return {
      help: {
        description: 'Output help menu.',
        alias: [alias.help, '--help'],
        usage: `${alias.help} --help`,
        callback: function([command]) {
          that.showHelp.call(that, {exit: true, command});
        },
        rules: '<number,string>',
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
        callback: () => console.log(this.commands),
      }}),
    };
  },


  // SECTION - Error checking
  /**
   * Ensure there are no conflicting aliases.
   * @param {[]} entries - Entries for each command.
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
   * @param {[]} entries - Entries for each command.
   */
  validateRules(entries = []) {
    const whitespaceInRule = /<\w*\s.*>|\[\w*\s.*\]/;
    const optionalBeforeRequired = '] <';
    entries.forEach((cmd, {rules}) => {
      cmd = `${cmd}.rules`;
      if (rules) {
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


  // SECTION - Helpers
  /**
   * Capitalizes default if there's a conflicting alias.
   * @return {{}} Non-conflicting aliases for default commands.
   */
  defaultShortAlias() {
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
   * @param {[]} entries - Entries for each command.
   * @return {[]} Array containing all command aliases.
   */
  allAliases(entries = []) {
    return entries.reduce((prev, [_, command]) =>
      ([...prev, ...command.alias]), []);
  },
};

module.exports = BuildTools;