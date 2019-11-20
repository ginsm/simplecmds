/* eslint-disable require-jsdoc */
// SECTION - Interface
const cmds = require('../cmds');

const options = {
  version: 'v1.1.0',
  description: 'Basic NodeJS Calculator',
  debug: false,
  defaultRule: {
    rule: '<number> [number]',
    amount: 0,
  },
};

cmds
    .set(options)
    .command('-a --add [nums]', 'Add numbers.', op((a, b) => a + b))
    .rule('<number> [number]')
    .command('-s --subtract [nums]', 'Subtract numbers.', op((a, b) => a - b))
    .rule('<number> [number]')
    .command('-d --divide [nums]', 'Divide numbers.', op((a, b) => a / b))
    .rule('<number> [number]')
    .command('-m --multiply [nums]', 'Multiply numbers.', op((a, b) => a * b))
    .rule('<number> [number]')
    .parse(process.argv);


function op(operation) {
  return function(args, valid) {
    valid ? console.log(args.reduce(operation)) : cmds.help();
  };
}
