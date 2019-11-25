/**
 * Dispatch an error and exit process.
 * @param {string} type - Error type.
 * @param {*} value - Relevant information.
 */
function error(type, value) {
  const message = {
    'CommandBuild':
      `No valid aliases found in ${value}.usage string.`,
  };
  console.error(`${type}Error: ${message[type]}`);
  process.exit();
}

module.exports = error;
