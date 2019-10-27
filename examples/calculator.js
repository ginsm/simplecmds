// SECTION - Interface
const cmds = require('../cmds')
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
  calculate(args, valid, op('+'));
}

function subtract(args, valid) {
  calculate(args, valid, op('-'));
}

function divide(args, valid) {
  calculate(args, valid, op('/'));
}

function multiply(args, valid) {
  calculate(args, valid, op('*'));
}


// SECTION - Helpers
function calculate(args, valid, operation) {
  valid ? console.log(args.reduce(operation)) : cmds.showHelp();
}

function op(operation) {
  return {
    '+': (a, b) => a + b, '-': (a, b) => a - b,
    '*': (a, b) => a * b, '/': (a, b) => a / b,
  }[operation];
}
