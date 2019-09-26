const cmdr = require('commander');
const validate = require('../lib/validate');

cmdr
    .option('hasRule')
    .option('noRule')
    .option('extra')
    .parse(process.argv);

validate
    .rule('hasRule', '<number> <string,number> [number]', 4)
    .rule('extra', '<number>', 1)
    .parse(cmdr);
