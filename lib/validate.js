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
    rule: (command = '', fixed = false, loose = false, amount = 0) => {
        Validate.rules[command] = { fixed, loose, amount };
        return Validate;
    },

    commands: {},


    getCommands: async (cmdr) => {
        const options = Object.keys(cmdr.opts());
        const args = cmdr.rawArgs.slice(2);
        parseArgs(args, options);
        console.log(Validate.commands);
        console.log(Validate.rules);
    },

    validate: (commands) => {

    }

}

module.exports = Validate;


function parseArgs(args, options) {
    // Objects to use during build process
    const commands = {};
    let build = [];

    // Array containing if each value in args is a command or not
    const booler = args.map(cmd => options.includes(cmd));

    // Build the object based off of the bool values
    booler.forEach((command, id) => {
        // Get the value of the index in args
        const value = args[id];
        // The last command that was built
        const lastCommand = build[build.length - 1];

        // True: create a key, false: insert value into key's array
        if (command) {
            commands[value] = [];
            build.push(value);
        } else {
            commands[lastCommand].push(value);
        }
    });

    const rules = Object.keys(Validate.rules);

    // Delete any commands that aren't being handled by validator
    Object.keys(commands)
        .filter((cmd) => !rules.includes(cmd))
        .forEach((cmd) => delete commands[cmd]);

    Validate.commands = commands;
}