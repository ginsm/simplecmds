const simplecmds = require('../src/simplecmds');

const options = {
  description: 'Print a message with a subject and body.',
  defaults: {
    rules: '<string,number>',
    amount: 1,
  },
};

const commands = {
  message: {
    usage: '-m --message @subjectCmd @bodyCmd',
    description: 'Write a message; requires -s and -b',
    callback: print,
    rules: false, // negate default rules
  },

  // The defaults will be added to the next two commands
  subject: {
    usage: '-s --subject <subject>',
    description: 'Set the subject text',
  },
  body: {
    usage: '-b --body <bodyText>',
    description: 'Set the body text',
  },
};

simplecmds
    .set(options)
    .commands(commands)
    .parse(process.argv);


// callback
function print({commands: {subject, body}}) {
  // Ensure that both commands are valid
  const bothValid = (subject.valid && body.valid) || simplecmds.showHelp(true);

  if (bothValid) {
    // add a limit of 60 characters
    const subjectText = subject.args[0].slice(0, 60);
    const bodyText = body.args[0];
    console.log(`Subject: ${subjectText}\nBody: ${bodyText}`);
  }
}
