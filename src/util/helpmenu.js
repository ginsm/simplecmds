const Help = {
  /**
   * Generate a single commands help menu string.
   * @param {{}} builderObj - The commands builder object.
   * @param {string} longestUsage - The longest command usage string's length.
   * @return {string} - The help item.
   */
  getCommandHelp({usage, description = ''}, longestUsage) {
    const spaces = Array((longestUsage + 4) - usage.length).join(' ');
    return `${usage} ${spaces} ${description}`;
  },
};

module.exports = Help;


/* TODO - Goal Help Menu


————————————————————————————————————————
            Main Help Menu
————————————————————————————————————————

Program: <Program> (version)
Description: <description>

Commands:
...commands

Defaults:
...defaults

Usage: <program> <command> [args]

————————————————————————————————————————


————————————————————————————————————————
            Single Command
————————————————————————————————————————

Program: <Program> (version)
Command: <command>
Aliases: <...aliases>

Command Help:
...command.help

Usage: <program> <command.usage>

————————————————————————————————————————


*/
