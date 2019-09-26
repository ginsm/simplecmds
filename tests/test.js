const cmdr = require('commander');
const validate = require('../lib/validate');

cmdr
    .option('hasRule')
    .option('noRule')
    .parse(process.argv);

validate
    .rule('hasRule', '<number> <string,number> [number]', 4)
    .parse(cmdr);
