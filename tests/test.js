const cmdr = require('commander');
const validate = require('../lib/validate');

cmdr
    .option('hasRule')
    .option('noRule')
    .parse(process.argv);

validate
<<<<<<< HEAD
    .rule('hasRule', '<number> <string,number> [number]', 2)
    .parse(cmdr);

=======
    .rule('hasRule', ['string'], ['number', 'string'], 2)
    .parse(cmdr);
>>>>>>> refs/remotes/origin/master
