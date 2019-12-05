// SECTION - Imports
const basename = require('path').basename;
const {longest, capitalize} = require('./helper');


const HelpMenu = {
  // SECTION - Help Pages

  /**
   * Outputs the main help page (all commands).
   * @param {[{}]} options - Every commands' build options.
   */
  mainPage(options) {
    const {helpString, programName} = HelpMenu;
    const length = longest(options.map((obj) => obj.usage)).length;
    const helpStrings = options.map(helpString(length));

    [`\nProgram: ${capitalize(programName)} (${this.version})`,
      this.description && `Description: ${this.description}\n` || '',
      'Commands:',
      ...helpStrings.slice(0, this.debug ? -3 : -2),
      `\nDefaults:`,
      ...helpStrings.slice(this.debug ? -3 : -2),
      `\nUsage: ${programName} <command> [...args]\n`,
    ].forEach((line) => console.log(line));
  },


  /**
   * Outputs a single command's help page.
   * @param {*} obj - The command's build object.
   */
  singleCommandPage(obj) {
    const {programName} = HelpMenu;
    [`\nProgram: ${capitalize(programName)} (${this.version})`,
      `Command: ${obj.alias.join(', ')}\n`,
      `${obj.helpPage || 'There is no help page for this command.'}\n`,
      `Usage: ${programName} ${obj.usage}\n`,
    ].forEach((line) => console.log(line));
  },


  // SECTION - Helpers

  /**
   * Generate a command's help string.
   * @param {string} length - The longest usage string's length.
   * @return {string} A generated command help string.
   */
  helpString(length) {
    return ({usage, description = ''}) => {
      const spaces = Array((length + 4) - usage.length).join(' ');
      return `${usage} ${spaces} ${description}`;
    };
  },


  /**
   * @return {string} The name of the program.
   */
  get programName() {
    return basename(process.argv[1], '.js');
  },
};

module.exports = HelpMenu;