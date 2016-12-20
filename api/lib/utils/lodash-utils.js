const _ = require('lodash').runInContext();

_.mixin({

  /*
   * Returns the second element of an array.
   */
  'second' : function(array) {
    return _.nth(array, 1);
  },

  /*
   * Returns the third element of an array.
   */
  'third' : function(array) {
    return _.nth(array, 2);
  },

  /*
   * Returns the element of the array that is after the the one provided.
   *
   * Example : - array is ["1st", "2nd", "3rd", "4th"]
   *           - currentElement is "2nd"
   *
   *           result will be "3rd"
   */
  'elementAfter' : function(array, currentElement) {
    if (_.isArray(array) && !_.isEmpty(array)) { // only relevant on non-empty array
      const currentIndex = _(array).indexOf(currentElement);
      if (currentIndex > -1) { // need to have an already-existing element inside the given array to work properly
        return _(array).nth(currentIndex + 1);
      }
    }
  }
});

module.exports = _;
