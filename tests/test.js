const cmdr = require('commander');
const validate = require('../lib/validate');

cmdr
    .option('hasRule', '')
    .option('noRule', '')
    .parse(process.argv);

validate
    .rule('hasRule', ['string'], ['number', 'string'], 2)
    .parse(cmdr);
