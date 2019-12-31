const simplecmds = require('../src/simplecmds');

const options = {
  version: 'v1.1.0',
  description: 'A basic single operation calculator',
  debug: false,
  defaults: {
    rules: '<number> [number]',
  },
};

const commands = {
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
};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);

function op(operation) {
  return function({args, valid}) {
    valid ? console.log(args.reduce(operation)) : this.help({exit: true});
  };
}
