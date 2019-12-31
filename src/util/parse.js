// SECTION - Imports
const {convertNumbers} = require('./helper');
const error = require('./error');


const Parsing = {
  // SECTION - Arguments

  /**
   * Generate an object containing commands and their args.
   * @param {[]} args - Process.argv
   * @param {{}} commands - Object containing commands.
   * @return {{}} Generated object containing args.
   * @example
   * { myCommand: [1, 2] }
   * @memberof parse.js
   */
  parseArgs(args, commands) {
    let key; // Used to keep track of the command being parsed.
    return convertNumbers(args)
        .reduce((prev, arg, id) => {
          // Find command with given alias or set as undefined
          const command = (commands.find(([_, obj]) => {
            return obj.alias.includes(arg);
          }) || [])[0];

          // Call help if first arg isn't a command and exit
          if (id == 0 && !command) {
            this.help();
            process.exit();
          }

          // Used for Building purposes
          key = command || key;
          const issuedAlready = prev[command] && [...prev[command]];
          const value = command ? issuedAlready || [] :
                [...(prev[key] && prev[key]), arg];

          // Continue building
          return ({...prev, [key]: value});
        }, {});
  },


  // SECTION - Aliases

  /**
   * Find every valid alias in an usage string.
   * @param {string} usage - Contains command aliases.
   * @param {string} command - The
   * @return {private} Array of found aliases (up to 2).
   * @example
   * generateAlias('-m --my-command [number]', 'myCommand');
   * // output -> ['-m', '--my-command']
   * @memberof parse.js
   */
  generateAlias(usage, command) {
    if (!usage) {
      error('Creation', `${command} does not have a usage string (required).`);
    }
    const aliases = /(?<!\S)(-\w\b|--[\w-]{3,}|(?=[^-])[\w-]{2,})/g;
    const matches = usage.match(aliases);
    return (matches || error('ParseError',
        `No valid aliases found in the ${command}.usage string.`)).slice(0, 2);
  },
};

module.exports = Parsing;
