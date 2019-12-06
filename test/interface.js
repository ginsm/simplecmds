/* eslint-disable require-jsdoc */
const cli = require('../src/simplecmds');
// const cli = require('../dist/simplecmds');

const options = {
  version: 'v0.1.0',
  description: 'Simplecmds Tester CLI.',
  debug: true,
  defaults: {
    amount: 1,
  },
};

const commands = {
  text: {
    usage: '-s --string <str>',
    description: 'Require a string.',
    callback: log,
    rules: '<string>',
  },
  num: {
    usage: '-n --number <num>',
    description: 'Require a number.',
    callback: log,
    rules: '<number>',
  },
  bool: {
    usage: '-b --boolean <bool>',
    description: 'Require a boolean.',
    callback: log,
    rules: '<boolean>',
  },
  any: {
    usage: '-A --any <str,num>',
    description: 'Require a string or number.',
    callback: log,
    rules: '<string,number>',
  },
  multi: {
    usage: '-m --multi <str> <num> [num,str]',
    description: 'Allow for multiple arguments.',
    callback: log,
    rules: '<string> <number> [number,string]',
    amount: 0,
  },
  limit: {
    usage: '-l --limit [args]',
    description: 'Limits amount of arguments.',
    callback: log,
    amount: 3,

  },
  wrongAmount: {
    usage: '-w --wrong-amount',
    description: 'Amount is less than required amount',
    callback: log,
    rules: '<number> <string>',
    // inherits 'amount: 1' from defaultRule
  },
  arglen: {
    usage: '-a --arg-length',
    description: 'Switch from outputting validity to arg length.',
    rules: '<boolean>',
  },
};

cli.set(options).commands(commands).parse(process.argv);

function log({args, valid, commands: {arglen}}) {
  const output = (arglen.valid ? args.length : valid);
  console.log(output);
}
