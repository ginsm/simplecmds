/**
 * Parses the commands object and checks for any errors.
 */
const BuildTools = {
  /**
   * Initiates the build tools and ensures there are no user errors.
   * @param {[]} entries - Entries for each command.
   */
  init(entries = []) {
    BuildTools.noConflictingAliases(entries);
    BuildTools.validateRules(entries);
    Object.assign(BuildTools, {
      commands: Object.fromEntries(entries),
    });
  },


  /**
   * Ensure there are no conflicting aliases.
   * @param {[]} entries - Entries for each command.
   */
  noConflictingAliases(entries = []) {
    const aliases = BuildTools.allAliases(entries);
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
