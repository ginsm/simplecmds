/**
 * Validate the types and amount of args for a command.
 * @param {[]} obj - Command arguments and rules.
 * @param {string} cmdName - Name of the command.
 * @return {boolean} Validity represented by a boolean.
 */
function typeCheck({args, rules}, cmdName) {
  const required = rules.filter((rule) => rule[0] === '<');
  const validRequiredAmount = args.length >= required.length;
  const lastNotation = rules.slice(-1)[0];

  // Check types
  const valid = (rules, arg) => rules.includes(typeof arg);
  const validTypes = args.map((arg, id) => {
    const idRequired = (required.length - 1 >= id);
    const noNotation = (id > rules.length - 1);
    return idRequired ? valid(rules[id], arg) : !idRequired &&
          (noNotation ? valid(lastNotation, arg) : valid(rules[id], arg));
  }).every((arg) => arg === true);

  return validRequiredAmount && validTypes;
}

module.exports = typeCheck;
