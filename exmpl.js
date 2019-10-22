const cmds = require('./cmds');

cmds
    .command('-c --create <text>', 'Create a task', console.log)
    .rule('<number,string>', 1)
    .command('-d --delete <id> [id]', 'Delete a task')
    .rule('<number> <number> [number]', 3)
    .command('-n --no-rule', 'No rule contained (testing)')
    .parse(process.argv);

console.log(cmds);
