const cmds = require('./cmds');

cmds
    .setVersion('v0.8.9')
    .description('An example project using cmds.js.')
    .command('-c --create <text>', 'Create a task')
    .rule('<number,string>', 1)
    .command('-d --delete <id> [id]', 'Delete a task')
    .rule('<number> <number> [number]', 3)
    .command('-n --no-rule', 'No rule contained (testing)')
    .parse(process.argv);

console.log(cmds);
