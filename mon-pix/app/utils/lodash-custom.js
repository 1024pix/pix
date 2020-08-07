import _ from 'lodash';

_.mixin({

  // See http://stackoverflow.com/a/10834843
  /* istanbul ignore next */
  isStrictlyPositiveInteger: function(str) {
    return /^\+?[1-9]\d*$/.test(str);
  },
  // Just an alias, ignore test
  /* istanbul ignore next */
  checkPoint: _.thru,
  isArrayOfString: function(x) {
    return _.isArray(x) && _.every(x, _.isString);
  },
  isNotArrayOfString: function(x) {
    return !_.isArrayOfString(x);
  },
  isNotArray: function(x) {
    return !_.isArray(x);
  },
  isArrayOfBoolean: function(x) {
    return _.isArray(x) && _.every(x, _.isBoolean);
  },
  isNotArrayOfBoolean: function(x) {
    return !_.isArrayOfBoolean(x);
  },
  isTruthy: function(x) {
    return x !== false                     // not the boolean false
      && x !== 0                           // not the number 0
      && x !== undefined                   // not an undefined value
      && x !== null                        // not a null value
      && x !== ''                          // not an empty string
      && !(_.isNaN(x))                         // not a NaN
      && !(_.isArray(x) && _.isEmpty(x))   // not an empty array
      && !(_.isObject(x) && _.isEmpty(x)); // not an empty object
  },
  isNonEmptyArray: function(x) {
    return _.isArray(x) && !_.isEmpty(x);
  },

  isNumeric: function isNumeric(value) {
    if (typeof value === 'number') return true;
    const str = (value || '').toString();
    if (!str) return false;
    return !isNaN(str);
  },

  // See http://veerasundar.com/blog/2013/01/underscore-js-and-guid-function/
  guid: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}, { chain: false });

export default _;
