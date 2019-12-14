/**
 * Dispatch an error and exit process.
 * @param {string} type - Error type.
 * @param {string} message - Message to issue about the error.
 * @memberof error.js
 */
function error(type, message) {
  console.error(`${type}Error: ${message}`);
  process.exit();
}

module.exports = error;
