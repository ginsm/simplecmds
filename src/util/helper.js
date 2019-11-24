const Helper = {
  /**
   * Capitalize the first letter of a word.
   * @param {string} word - Word to capitalize.
   * @return {string} Capitalized word.
   * @example
   * capitalize('hello');
   * // output -> 'Hello'
   */
  capitalize(word) {
    return word[0].toUpperCase() + word.substr(1);
  },


  /**
   * Find the longest string in an array.
   * @param {[string]} arr - Array of strings.
   * @return {string} Length of the longest string.
   */
  longestString(arr) {
    return arr.reduce((a, b) => b.length > a.length ? b : a).length;
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
   */
  convertNumbers(input) {
    const convert = (arg) => +arg ? +arg : arg;
    return Array.isArray(input) && input.map(convert) || convert(input);
  },


  /**
   * Flatten an array.
   * @param {[]} arr - Array to flatten.
   * @return {[]} The flattened array.
   */
  flatten(arr) {
    return Array.prototype.concat.apply([], arr);
  },


  /**
   * Concatenate two arrays alternating the values of the arrays.
   * @param {[]} sup - Leading values.
   * @param {[]} sub - Trailing values.
   * @return {[]} New array containing alternated values.
   * @example
   * alternate([1, 3, 5], [2, 4, 6]);
   * // output -> [1, 2, 3, 4, 5, 6]
   */
  alternate(sup, sub) {
    return [...sup.reduce((prev, curr, id) => {
      return sub[id] ? [...prev, curr, sub[id]] : [...prev, curr];
    }, []), ...sub.slice(sup.length)];
  },
};

module.exports = Helper;
