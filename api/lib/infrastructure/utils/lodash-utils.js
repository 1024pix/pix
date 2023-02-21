import { runInContext } from 'lodash';
const _ = runInContext();

_.mixin({
  /*
   * Returns the second element of an array.
   */
  second: function (array) {
    return _.nth(array, 1);
  },

  /*
   * Returns the third element of an array.
   */
  third: function (array) {
    return _.nth(array, 2);
  },

  isNotEmpty: function (elt) {
    return !_.isEmpty(elt);
  },

  ensureString: function (elt) {
    if (elt) {
      return elt.toString();
    } else {
      return '';
    }
  },
  areCSVequivalent: function (string1, string2) {
    if (_.isString(string1) && _.isString(string2)) {
      const splitTrimSort = function (str) {
        return _.chain(str) // "3, 1, 2 "
          .split(',') // ["3"," 1"," 2 "]
          .map(_.trim) // ["3","1","2"]
          .sort() // ["1","2","3"]
          .value();
      };
      return _(splitTrimSort(string1)).isEqual(splitTrimSort(string2));
    }
    return false;
  },

  /*
   * Returns the element of the array that is after the the one provided.
   *
   * Example : - array is ["1st", "2nd", "3rd", "4th"]
   *           - currentElement is "2nd"
   *
   *           result will be "3rd"
   */
  elementAfter: function (array, currentElement) {
    if (_.isArray(array) && !_.isEmpty(array)) {
      // only relevant on non-empty array
      const currentIndex = _(array).indexOf(currentElement);
      if (currentIndex > -1) {
        // need to have an already-existing element inside the given array to work properly
        return _(array).nth(currentIndex + 1);
      }
    }
  },
  isBlank(string) {
    return _.isUndefined(string) || _.isNull(string) || string.trim().length === 0;
  },
  isArrayOfString: function (x) {
    return _.isArray(x) && _.every(x, _.isString);
  },
  isNotString: function (x) {
    return !_.isString(x);
  },
  isNotArrayOfString: function (x) {
    return !_.isArrayOfString(x);
  },
});

export default _;
