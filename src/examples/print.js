/* eslint-disable require-jsdoc */
const simplecmds = require('../simplecmds');

const options = {
  description: 'Print a message with a subject and body.',
  defaultRule: {
    rule: '<string,number>',
    amount: 1,
  },
};

const commands = {
  message: {
    usage: '-m --message *subject *body',
    description: 'Write a message; requires -s and -b',
    callback: print,
    rule: false, // negate defaultRule
  },

  // The default rule will be added to the next two commands
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
function print(args, valid, {subject, body}) {
  // Ensure that both commands are valid
  const bothValid = (subject.valid && body.valid) || simplecmds.showHelp(true);

  if (bothValid) {
    // add a limit of 60 characters
    const subjectText = subject.args[0].slice(0, 60);
    const bodyText = body.args[0];
    console.log(`Subject: ${subjectText}\nBody: ${bodyText}`);
  }
}
