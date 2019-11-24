/**
 * Validate the types and amount of args for a command.
 * @param {[]} obj - Command name and object.
 * @return {boolean} Validity represented by a boolean.
 */
function typeCheck({rule, amount = 0, args}) {
  if (rule) {
    rule = rule.split(' ');
    const required = rule.filter((rule) => rule[0] === '<');
    const validRequiredAmount = args.length >= required.length;
    const validAmount = args.length <= amount && validRequiredAmount;
    const lastNotation = rule.slice(-1)[0];

    // Check types
    const valid = (rule, arg) => rule.includes(typeof arg);
    const validTypes = args.map((arg, id) => {
      const idRequired = (required.length - 1 >= id);
      const noNotation = (id > rule.length - 1);
      return idRequired ? valid(rule[id], arg) : !idRequired &&
            (noNotation ? valid(lastNotation, arg) : valid(rule[id], arg));
    }).every((arg) => arg === true);

    return (amount ? validAmount : validRequiredAmount) && validTypes;
  }
}

module.exports = typeCheck;
