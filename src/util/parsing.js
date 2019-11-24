const {flatten, alternate} = require('./helper');

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
          const command = (commands.find(([_, obj]) => {
            return obj.alias.includes(arg);
          }) || [])[0];
          ((id == 0 && !command) && this.showHelp.call(this, true));
          const building = command || prev.building;
          const exists = prev.hasOwnProperty(command) && [...prev[command]];
          const key = command || prev.building;
          const value = command ? exists || [] : [...prev[building], arg];
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
        const aliases = arg.replace(/(?<!\W)(?=\w)/g, '-').split(/(?=\W)/g);
        const groupedArgs = /\w+(,\w+)+/g.test(arr[id + 1]);
        const args = groupedArgs && arr[id + 1].split(',') || [];
        return alternate(aliases, args);
      }
      return /\w+(,\w+)+/g.test(arg) ? undefined : arg;
    })).filter((arg) => arg);
  },
};

module.exports = Parsing;
