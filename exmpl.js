const cmds = require('./cmds');

console.time('Build time');
cmds
    .command('-c --create <text>', 'create a task')
    .rule('<number,string>', 1)
    .command('-n --no-rule', 'No rule contained')
    .command('-d --delete <id> [id]', 'delete a task')
    .rule('<number> [number]', 1)
    .parse(process.argv);
console.timeEnd('Build time');

console.log(cmds);
