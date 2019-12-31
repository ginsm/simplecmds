const Helper = {
  /**
   * Capitalize the first letter of a word.
   * @param {string} word - Word to capitalize.
   * @return {string} Capitalized word.
   * @example
   * capitalize('hello');
   * // output -> 'Hello'
   * @memberof helper.js
   */
  capitalize(word) {
    return word[0].toUpperCase() + word.substr(1);
  },


  /**
   * Find the longest string in an array.
   * @param {[string]} arr - Array of strings.
   * @return {string} Length of the longest string.
   * @memberof helper.js
   */
  longest(arr) {
    return arr.reduce((a, b) => b.length > a.length ? b : a);
  },


  /**
   * Convert any stringed number to a number.
   * @param {[]|string} input - Value(s) to be converted.
   * @return {[]|number} - Returns the input after attempting conversion.
   * @example
   * convertNumbers('12');
   * // output -> 12
   * convertNumbers(['test', '13', '15']);
   * // output -> ['test', 13, 15]
   * @memberof helper.js
   */
  convertNumbers(input) {
    const convert = (arg) => {
      return typeof +arg == 'number' && !isNaN(+arg) ? +arg : arg;
    };
    return Array.isArray(input) && input.map(convert) || convert(input);
  },
};

module.exports = Helper;
