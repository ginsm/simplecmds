// SECTION - Polyfills
require('core-js/features/object/from-entries');

// SECTION - Imports
const {mainPage, singleCommandPage} =
      require('./util/helpmenu');
const {parseArgs, generateAlias} =
      require(`./util/parse`);
const {buildCommands, issueCallbacks} =
      require('./util/build');
const buildTools = require('./util/buildtools');

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Create commands using an object.
   * @param {{}} commands - Object containing command options.
   * @return {{}} 'this' for chaining.
   * @see https://github.com/ginsm/simplecmds/wiki#command-options
   */
  commands(commands) {
    buildTools.init(
        Object.entries(commands)
            .map(([key, command]) => [key, {
              alias: generateAlias(command.usage, key),
              ...this.defaults,
              ...command,
            }]),
        this,
    );
    return this;
  },


  /**
   * @description Set the program options.
   * @param {{}} options - Object containing program options.
   * @return {Private} 'this' for chaining.
   * @see https://github.com/ginsm/simplecmds/wiki#program-options
   */
  set(options = {}) {
    return Object.assign(this, {
      // defaults
      version: 'v1.0.0',
      debug: false,
      // user options
      ...options,
    });
  },


  // SECTION - Main Parser

  /**
   * @description Parse the process.argv input.
   * @param {[]} args - Expects process.argv.
   * @return {{}} The output generated from buildCommands.
   */
  parse(args) {
    // run set method even if the user did not invoke it (defaults)
    (!this.hasOwnProperty('version') && this.set());

    // remove node variables
    args = args.slice(2);

    (!args.length && this.help({exit: true}));

    // build the output object
    const output = buildCommands.call(this,
        buildTools.directive,
        parseArgs.call(this, args, Object.entries(buildTools.directive)),
    );
    Object.assign(this, {cmds: output});

    issueCallbacks(buildTools.directive, output);
    return output;
  },


  // SECTION - Help Menu Interface

  /**
   * @description Output a help menu.
   * @param {{}} options - default: {exit: false, command: false}
   * @see https://github.com/ginsm/simplecmds/wiki/HelpMenu
   */
  help({exit = false, command = false}) {
    if (command) {
      singleCommandPage
          .call(this, buildTools.searchDirective(command));
    } else {
      mainPage
          .call(this, Object.values(buildTools.directive));
    }
    (exit && process.exit());
  },
};

module.exports = Cmds;
