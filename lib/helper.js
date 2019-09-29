const Helper = {
  /**
   * @description Remove any dashes and camel case a string.
   * @param {string} string - String to normalize.
   * @return {string} Normalized string.
   */
  normalize: (string) => {
    // Replace any -, trim trailing whitespace and split by those spaces
    return string.replace(/-/g, ' ').trim().split(' ')
        // Capitalize first letter of each word and join them together
        .map((text, id) => {
          return !id && text || text[0].toUpperCase() + text.slice(1);
        }).join('');
  },

  /**
   * @description - Dispatches an error and exits process.
   * @param {number} code - Error code.
   * @param {*} value - Relevant information.
   */
  error: (code, value) => {
    // Contains error messages
    const errors = [
      `No flags present in command '${value}'.`,
      `Unable to create command '${value}'.`,
    ];

    // Log error and exit
    console.error(`[Error] ${errors[code]}`);
    process.exit();
  },
};

module.exports = Helper;
