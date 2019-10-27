/* eslint-disable require-jsdoc */
// SECTION - Interface
const cmds = require('./cmds')
    .setVersion('v0.1.0')
    .description('Basic NodeJS Calculator')
    .command('-a --add [nums]', 'Add numbers.', add)
    .rule('<number> [number]')
    .command('-s --subtract [nums]', 'Subtract numbers.', subtract)
    .rule('<number> [number]')
    .command('-d --divide [nums]', 'Divide numbers.', divide)
    .rule('<number> [number]')
    .command('-m --multiply [nums]', 'Multiply numbers.', multiply)
    .rule('<number> [number]')
    .parse(process.argv);


// SECTION - Command Handlers
function add(args, valid) {
  mathHandler(args, valid, op('+'));
}

function subtract(args, valid) {
  mathHandler(args, valid, op('-'));
}

function divide(args, valid) {
  mathHandler(args, valid, op('/'));
}

function multiply(args, valid) {
  mathHandler(args, valid, op('*'));
}


// SECTION - Helpers
function mathHandler(args, valid, operation) {
  if (valid) {
    console.log(args.reduce(operation));
  } else {
    cmds.showHelp();
  }
}

function op(operation) {
  return {
    '+': (a, b) => a + b, '-': (a, b) => a - b,
    '*': (a, b) => a * b, '/': (a, b) => a / b,
  }[operation];
}
