/* eslint-disable require-jsdoc */
const cli = require('../dist/simplecmds');

const options = {
  version: 'v0.1.0',
  description: 'Simplecmds Tester CLI.',
  debug: false,
  defaultRule: {
    amount: 1,
  },
};

const commands = {
  text: {
    usage: '-t --text <str>',
    description: 'Require a string.',
    callback: log,
    rule: '<string>',
  },
  num: {
    usage: '-n --number <num>',
    description: 'Require a number.',
    callback: log,
    rule: '<number>',
  },
  bool: {
    usage: '-b --boolean <bool>',
    description: 'Require a boolean.',
    callback: log,
    rule: '<boolean>',
  },
  any: {
    usage: '-A --any <str,num>',
    description: 'Require a string or number.',
    callback: log,
    rule: '<string,number>',
  },
  multi: {
    usage: '-m --multi <str> <num> [num,str]',
    description: 'Allow for multiple arguments.',
    callback: log,
    rule: '<string> <number> [number,string]',
    amount: 0,
  },
  limit: {
    usage: '-l --limit [args]',
    description: 'Limits amount of arguments.',
    callback: log,
    amount: 3,

  },
  argl: {
    usage: '-a --arg-length',
    description: 'Switch from outputting validity to arg length.',
    rule: '<boolean>',
  },
};

cli.set(options).commands(commands).parse(process.argv);

function log(args, valid, {argl}) {
  const output = (argl.valid ? args.length : valid);
  console.log(output);
}
