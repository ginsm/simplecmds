/* eslint-disable require-jsdoc */
const simplecmds = require('../cmds');

simplecmds
    .set({
      version: 'v1.1.0',
      description: 'Basic NodeJS Calculator',
      debug: false,
      defaultRule: {
        rule: '<number> [number]',
        amount: 0,
      },
    })
    .commands({
      add: {
        usage: '-a --add [nums]',
        description: 'Add all numbers given.',
        callback: op((a, b) => a + b),
      },
      subtract: {
        usage: '-s --subtract [nums]',
        description: 'Subtract all numbers given',
        callback: op((a, b) => a - b),
      },
      divide: {
        usage: '-d --divide [nums]',
        description: 'Divide all numbers given',
        callback: op((a, b) => a / b),
      },
      multiply: {
        usage: '-m --multiply [nums]',
        description: 'Multiply all numbers given',
        callback: op((a, b) => a * b),
      },
    })
    .parse(process.argv);


function op(operation) {
  return function(args, valid) {
    valid ? console.log(args.reduce(operation)) : simplecmds.help();
  };
}
