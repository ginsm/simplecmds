const cmdr = require('commander');
const validate = require('../lib/validate');

cmdr
    .option('hasRule')
    .option('noRule')
    .option('bool')
    .parse(process.argv);

validate
    .rule('hasRule', '<number> <string,number> [number]', 4)
    .rule('bool', '<boolean>', 1)
    .parse(cmdr);
