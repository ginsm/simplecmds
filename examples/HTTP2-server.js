// Imports
const simplecmds = require('../src/simplecmds')
const fs = require('fs');

// Our program options
const options = {
  description: 'Save HTTP2 server profiles.',
  defaults: {
    rules: '<string>',
    amount: 1,
  }
};

// This string will be used for the 'save' command's help page.
const saveHelpPage = 
"This command lets you create a configuration profile for your server.\n\n\
* You must provide a key and certificate in order to create a profile.\n\n\
You can provide them using the following commands:\n\
  -k --key     Set the private key path\n\
  -c --cert    Set the certificate path\n\n\
You can provide an optional port to change it from the default (443):\n\
  -p --port    Set the port number";


// Each one of these inherits the program option's 'defaults' properties.
const commands = {
  // inherits amount: 1
  save: {
    // usage: '-s --save <profile>',
    description: 'Create a new config profile',
    callback: saveProfile,
    rules: '<number,string>',
    help: saveHelpPage,
  },

  // inherits amount: 1 and rules: '<string>'
  key: {
    usage: '-k --key <path>',
    description: 'Set the private key path',
  },

  // inherits amount: 1 and rules: '<string>'
  cert: {
    usage: '-c --cert <path>',
    description: 'Set the certificate path',
  },

  // inherits amount: 1
  port: {
    usage: '-p --port <number>',
    description: 'Set the port number (optional)',
    rules: '<number>',
  }
};

// Run simplecmds with the options/commands.
simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);


// Our callback function
function saveProfile({args: [name], valid, commands: {key, cert, port}}) {
  // Ensure 'save', 'key', and 'cert' arguments were all valid.
  if (valid && key.valid && cert.valid) {

    // Convert the data to JSON.
    const config = JSON.stringify({
      name,
      key: key.args[0],
      cert: cert.args[0],
      port: (port.valid && port.args[0] || 443),
    }, null, 2);

    // Create the directory if it does not exist yet.
    const directory = `${__dirname}/profiles`;

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }

    // Write the config to a file and alert the user.
    fs.writeFileSync(`${directory}/${name}.json`, config);
    return console.log(`HTTP2-server: '${name}' created!`);
  }

  // Print the help page for 'save' if any commands were invalid.
  this.help({exit: true, command: 'save'});
}