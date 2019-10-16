const cmds = require('./cmds');

console.time('Build time');
cmds
    .command('-c --create <text>', 'Create a task')
    .rule('<number,string>', 1)
    .command('-d --delete <id> [id]', 'Delete a task')
    .rule('<number> [number]', 1)
    .command('-n --no-rule', 'No rule contained (testing)')
    .parse(process.argv);
console.timeEnd('Build time');

console.log(cmds.commands);
