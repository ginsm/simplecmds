/**
 * Validate the types and amount of args for a command.
 * @param {[]} obj - Command arguments and rule.
 * @param {string} cmdName - Name of the command.
 * @return {boolean} Validity represented by a boolean.
 */
function typeCheck({args, rule}, cmdName) {
  const required = rule.filter((rule) => rule[0] === '<');
  const validRequiredAmount = args.length >= required.length;
  const lastNotation = rule.slice(-1)[0];

  // Check types
  const valid = (rule, arg) => rule.includes(typeof arg);
  const validTypes = args.map((arg, id) => {
    const idRequired = (required.length - 1 >= id);
    const noNotation = (id > rule.length - 1);
    return idRequired ? valid(rule[id], arg) : !idRequired &&
              (noNotation ? valid(lastNotation, arg) : valid(rule[id], arg));
  }).every((arg) => arg === true);

  return validRequiredAmount && validTypes;
}

module.exports = typeCheck;
