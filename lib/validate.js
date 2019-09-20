const Validate = {
    parseCmdr: (cmdr) => {
        Validate.getCommands(cmdr)
    },

    /**
     * Contains the rules and their options.
     */
    rules: {},

    /**
     * Create a validation rule
     * 
     * @param {String} command - The command name.
     * @param {Array} fixed - Fixed argument types.
     * @param {Array} loose - Loose argument types.
     * @param {Number} amount - Acceptable amount of arguments.
     * @param {Function} callback - Expects an invalid command handler.
     */
    rule: (command = '', fixed = false, loose = false, amount = 0, required = false) => {
        Validate.rules[command] = { fixed, loose, amount, required };
        return Validate;
    },

    commands: [],


    getCommands: async (cmdr) => {
        // Get the commands and their arguments
        const commands = Object.keys(cmdr.opts());
        const args = cmdr.rawArgs.slice(2);

        const commandObj = {};
        let done = [];
        const filtered = args.map(cmd => commands.includes(cmd))
        const buildObject = filtered.forEach((bool, index) => {
            const arg = args[index];
            if (bool) {
                commandObj[arg] = [];
                done.push(arg);
            } else {
                commandObj[done[done.length - 1]].push(arg);
            }
        })

        console.log(commandObj)

        const rules = Object.keys(Validate.rules);
    },

    validate: (commands) => {
        console.log(commands)
    }

}

module.exports = Validate;