const simplecmds = require('../src/simplecmds')
const fs = require('fs');

const options = {
  description: 'Save HTTP2 server profiles.',
  defaults: {
    rules: '<string>',
    amount: 1,
  }
};

// this string will be used for the 'save' command's help page.
const saveHelp = 'This command lets you create a configuration profile for your server.\n\n\
You must provide a key and certificate in order to create a profile.\n\
You can issue them by running the following commands:\n\n\
  -k --key     Set the private key path\n\
  -c --cert    Set the certificate path\n\n\
You can provide an optional port to change it from the default (443):\n\n\
  -p --port    Set the port number'


// each one of these inherits 'amount' from program option's 'defaults' property.
const commands = {
  save: {
    usage: '-s --save <profile>',
    description: 'Create a new profile',
    callback: saveProfile,
    rules: '<number,string>',
    help: saveHelp,
  },
  key: {
    usage: '-k --key <path>',
    description: 'Set the private key path',
  },
  cert: {
    usage: '-c --cert <path>',
    description: 'Set the certificate path',
  },
  port: {
    usage: '-p --port <number>',
    description: 'Set the port number',
    rules: '<number>',
  }
};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);


function saveProfile({args: [name], valid, commands: {key, cert, port}}) {
  // Ensure 'save', 'key', and 'cert' were all valid.
  if (valid && key.valid && cert.valid) {
    // Convert the data to JSON.
    const config = JSON.stringify({
      name,
      key: key.args[0],
      cert: cert.args[0],
      port: (port.valid && port.args[0] || 443),
    }, null, 2);

    // Create the directory if it does not exist yet.
    if (!fs.existsSync(`${__dirname}/profiles/`)) {
      fs.mkdirSync(`${__dirname}/profiles/`);
    }

    // Write the config to a file and alert the user.
    fs.writeFileSync(`${__dirname}/${name}.json`, config);
    return console.log(`HTTP2-server: '${name}' created!`);
  }
  
  // Print the help page for 'save' if any commands were invalid.
  simplecmds.help({exit: true, command: 'save'});
}