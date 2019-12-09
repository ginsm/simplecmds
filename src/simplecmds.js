// SECTION - Imports
const {mainPage, singleCommandPage} =
      require('./util/helpmenu');
const {parseArgs, expandAliases, generateAlias} =
      require(`./util/parse`);
const {buildCommands, issueCallbacks} =
      require('./util/build');
const buildTools = require('./util/buildtools');

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Create commands using an object.
   * @param {{}} commands - Object containing command options.
   * @example
   * {
   *  myCommand: {
   *    // invoked with -c or --my-command
   *    usage: '-c --my-command <text>',
   *    // used in the help menu
   *    description: 'My command does ...',
   *    // called with (args, valid, commands)
   *    callback: myFunction,
   *    // first arg must be a string
   *    rules: '<string>',
   *    // only allow one argument
   *    amount: 1,
   *  },
   * }
   * @return {{}} 'this' for chaining.
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
   * @param {{}} options - Program options.
   * @example
   * {
   *   version: 'v1.0.0',
   *   descrition: 'My simple NodeJS Program',
   *   debug: true,
   *   // default command options
   *   defaults: {
   *     rules: '<number> [number]',
   *     amount: 0,
   *   },
   * }
   * @return {Private} 'this' for chaining.
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

    // expand concatenated aliases and arguments
    args = expandAliases(args.slice(2));
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


  // SECTION - Show Help Menu

  /**
   * @description Output the program's help menu.
   * @param {[]} args - The command arguments.
   * @param {boolean} valid - Whether the command was valid or not.
   * @param {{}} commands - The command args/validity object.
   * @param {boolean} options - Exit program after running; default false.
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
