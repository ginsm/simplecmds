// Node Imports
const basename = require('path').basename;
const {parseArgs, expandAliases} =
      require(`./util/parsing`);
const {longestString, convertNumbers, capitalize} =
      require('./util/helper');
const {generateAlias, addDefaultCommands, buildCommands, issueCallbacks} =
      require('./util/building');

/**
   * Contains the commands during building.
   */
const Builder = {};

const Cmds = {
  // SECTION - Object Creation

  /**
   * Build the commands from a given object.
   * @param {{}} commands - Object containing all commands.
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
   * @return {Private} 'this' for chaining.
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
  * Set the program options.
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
   * Parse process.argv and process the arguments.
   * @param {[]} args - Expects process.argv.
   * @return {{}} Command object generated from buildCommands.
   */
  parse(args) {
    // run set even if the user did not invoke it
    (!this.version && this.set({}));

    addDefaultCommands.call(this, Builder);
    args = convertNumbers(expandAliases(args.slice(2)));
    (!args.length && this.showHelp(true));

    // Command building
    const commands = buildCommands.call(this,
        Builder,
        parseArgs.call(this, args, Object.entries(Builder))
    );

    issueCallbacks(Builder, commands);

    return commands;
  },


  // SECTION - Help Menu

  /**
   * Output the program's help menu.
   * @param {boolean} exit - Exit program after running.
   */
  showHelp(exit = false) {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(Builder).map((cmd) => cmd.usage);
    const longestUsage = longestString(cmdUsage);
    const defaultAmount = this.debug ? -2 : -1;

    // Build command usage and description strings
    const cmds = Object.values(Builder).map(({usage, description}) => {
      const spaces = Array((longestUsage + 4) - usage.length).join(' ');
      return `${usage} ${spaces} ${description}`;
    });

    [`Program: ${capitalize(programName)} (${this.version})`,
      this.description && `Description: ${this.description}\n` || '',
      'Commands:',
      ...cmds.slice(0, defaultAmount),
      `\nDefaults:`,
      ...cmds.slice(defaultAmount),
      `\nUsage: ${programName} <command> [...args]`,
    ].forEach((line) => console.log(line));

    (exit && process.exit());
  },
};

module.exports = Cmds;
