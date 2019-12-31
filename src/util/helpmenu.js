// SECTION - Imports
const basename = require('path').basename;
const {longest, capitalize} = require('./helper');


const HelpMenu = {
  // SECTION - Help Pages

  /**
   * Outputs the main help page (all commands).
   * @param {[{}]} options - Every commands' build options.
   * @memberof helpmenu.js
   */
  mainPage(options) {
    const {helpString, programName} = HelpMenu;
    const length = longest(options.map((obj) => obj.usage)).length;
    const helpStrings = options.map(helpString(length));

    console.log(
        [`\nProgram: ${capitalize(programName)} (${this.version})`,
          this.description && `Description: ${this.description}\n` || '',
          'Commands:',
          ...helpStrings.slice(0, this.debug ? -3 : -2),
          `\nDefaults:`,
          ...helpStrings.slice(this.debug ? -3 : -2),
          `\nUsage: ${programName} <command> [...args]\n`,
        ].join('\n'),
    );
  },


  /**
   * Outputs a single command's help page.
   * @param {*} obj - The command's build object.
   * @memberof helpmenu.js
   */
  singleCommandPage(obj) {
    const {programName} = HelpMenu;
    const help = obj.help;
    const description = obj.description;

    console.log(
        [`\nProgram: ${capitalize(programName)} (${this.version})`,
          `Command: ${obj.alias.join(', ')}\n`,
          `${
            help || description || 'There is no help page for this command.'
          }\n`,
          `Usage: ${programName} ${obj.usage}`,
          '',
        ].join('\n'),
    );
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
