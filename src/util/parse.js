const {convertNumbers, flatten, alternate} = require('./helper');
const error = require('./error');

const Parsing = {
  /**
   * Generate an object containing commands and their args.
   * @param {[]} args - Process.argv
   * @param {{}} commands - Object containing commands.
   * @return {{}} Generated object containing args.
   * @example
   * { myCommand: [1, 2] }
   */
  parseArgs(args, commands) {
    return args
        .reduce((prev, arg, id) => {
          // Find command with given alias or set as undefined
          const command = (commands.find(([_, obj]) => {
            return obj.alias.includes(arg);
          }) || [])[0];

          // call help if first arg isn't a command
          ((id == 0 && !command) && this.showHelp.call(this, true));

          // Used for building purposes
          const building = command || prev.building;
          const exists = prev.hasOwnProperty(command) && [...prev[command]];
          const key = command || prev.building;

          // Arg spread expands concatenated arguments
          const value = command ? exists || [] : [
            ...prev[building],
            ...((typeof arg == 'string') ? arg.includes('+') ?
              convertNumbers(arg.split('+')) : [arg] : [arg]),
          ];

          return ({...prev, [key]: value, building});
        }, {});
  },

  /**
 * Expands concatenated aliases and arguments.
 * @param {[*]} arr - Process.argv
 * @return {[*]} Aliases and arguments expanded in place.
 * @example
 * expandAliases(['-l', 'one', '-abc', '1,2,3']);
 * // output -> ['-l', 'one', '-a', 1, '-b', 2, '-c', 3]
 */
  expandAliases(arr) {
    return flatten(arr.map((arg, id, arr) => {
      const groupedAliases = /(?<!\S)-\w{2,}/.test(arg);
      if (groupedAliases) {
        // -ab -> -a -b
        const aliases = arg.replace(/(?<!\W)(?=\w)/g, '-').split(/(?=\W)/g);
        const groupedArgs = /\w+(,\w+)+/g.test(arr[id + 1]);
        // split args up to be alternated with aliases
        const args = groupedArgs && arr[id + 1].split(',') || [];
        return alternate(aliases, args);
      }
      return /\w+(,\w+)+/g.test(arg) ? undefined : arg;
    })).filter((arg) => arg);
  },

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
    return (matches || error('ParseError',
        `No valid aliases found in ${command}.usage string.`)).slice(0, 2);
  },
};

module.exports = Parsing;