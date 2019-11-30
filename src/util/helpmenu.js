const basename = require('path').basename;
const {longestString, capitalize} =
      require('./util/helper');

      
module.exports = (exit = false) {
  const programName = basename(process.argv[1], '.js');
  const cmdUsage = Object.values(Builder).map((cmd) => cmd.usage);
  const longestUsage = longestString(cmdUsage);
  const defaultAmount = this.debug ? -3 : -2;

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
};
