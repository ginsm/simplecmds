const {convertNumbers} = require('./util/helper');
const showHelp = require('./util/helpmenu');
const {parseArgs, expandAliases, generateAlias} =
      require(`./util/parse`);
const {addDefaultCommands, buildCommands, issueCallbacks} =
      require('./util/build');

/**
   * Contains the commands building instructions.
   */
const Builder = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * @description Build the commands from a given object.
   * @param {{}} commands - Object containing command options.
   * @example
   * {
   *  myCommand: {
   *    // invoked with -c or --my-command
   *    usage: '-c --my-command <text>',
   *    // used in the help menu
   *    description: 'My command',
   *    // called with (args, valid, commands)
   *    callback: myFunction,
   *    // first arg must be a string
   *    rule: '<string>',
   *    // only one arg accepted
   *    amount: 1,
   *  },
   * }
   * @return {{}} 'this' for chaining.
   */
  commands(commands) {
    commands = Object.entries(commands)
        .map(([key, command]) => [key, {
          alias: generateAlias(command.usage, key),
          ...this.defaultRule,
          ...command,
        }]);
    Object.assign(Builder, Object.fromEntries(commands));
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
   *   defaultRule: {
   *     rule: '<number> [number]',
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
   * @description Parse process.argv and process the arguments.
   * @param {[]} args - Expects process.argv.
   * @return {{}} Command object generated from buildCommands.
   */
  parse(args) {
    // run set even if the user did not invoke it
    (!this.hasOwnProperty('version') && this.set({}));

    addDefaultCommands.call(this, Builder);
    args = convertNumbers(expandAliases(args.slice(2)));
    (!args.length && this.showHelp(true));

    const commands = buildCommands.call(this,
        Builder,
        parseArgs.call(this, args, Object.entries(Builder)),
    );

    issueCallbacks(Builder, commands);

    return commands;
  },

  /**
   * @description Output the program's help menu.
   * @param {boolean} exit - Exit program after running.
   */
  showHelp,
};

module.exports = Cmds;
