const basename = require('path').basename;
const {longestString, capitalize} =
      require('./util/helper');
const {parseArgs, expandAliases, generateAlias} =
      require(`./util/parse`);
const {addDefaultCommands, buildCommands, issueCallbacks} =
      require('./util/build');
const buildTools = require('./util/build-tools');

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
   * @description Parse process.argv and process the arguments.
   * @param {[]} args - Expects process.argv.
   * @return {{}} Command object generated from buildCommands.
   */
  parse(args) {
    // run set method even if the user did not invoke it (defaults)
    (!this.hasOwnProperty('version') && this.set({}));

    addDefaultCommands.call(this, buildTools.commands);

    // expand concatenated aliases and arguments
    args = expandAliases(args.slice(2));
    (!args.length && this.showHelp(true));

    const commands = buildCommands.call(this,
        buildTools.commands,
        parseArgs.call(this, args, Object.entries(buildTools.commands)),
    );

    issueCallbacks(buildTools.commands, commands);

    return commands;
  },


  /**
   * @description Output the program's help menu.
   * @param {boolean} exit - Exit program after running; default false.
   */
  showHelp(exit = false) {
    const programName = basename(process.argv[1], '.js');
    const cmdUsage = Object.values(buildTools.commands).map((cmd) => cmd.usage);
    const longestUsage = longestString(cmdUsage).length;
    const defaultAmount = this.debug ? -3 : -2;

    // Build command usage and description strings
    const cmds = Object.values(buildTools.commands)
        .map(({usage, description = ''}) => {
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
