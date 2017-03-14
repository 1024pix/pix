/* global _ */

_.mixin({

  // Simple alias for includes, last arg fromIndex excluded.
  // Therefore, no test on this function.
  /* istanbul ignore next */
  isAmongst: function (element, collection) {
    return _.includes(collection, element);
  },
  forceString: function (x) {
    if (_(x).isNonEmptyString()) {
      return x;
    } else {
      return '';
    }
  },
  // See http://stackoverflow.com/a/10834843
  /* istanbul ignore next */
  isStrictlyPositiveInteger: function (str) {
    return /^\+?[1-9]\d*$/.test(str);
  },
  // Just an alias, ignore test
  /* istanbul ignore next */
  checkPoint: _.thru,
  isTrue: function (x) {
    return x === true;
  },
  removeFirstElement: function (x) {
    return _.drop(x, 1);
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
  isNotArray: function (x) {
    return !_.isArray(x);
  },
  isArrayOfBoolean: function (x) {
    return _.isArray(x) && _.every(x, _.isBoolean);
  },
  isNotArrayOfBoolean: function (x) {
    return !_.isArrayOfBoolean(x);
  },
  isTruthy: function (x) {
    return x !== false                     // not the boolean false
      && x !== 0                           // not the number 0
      && x !== undefined                   // not an undefined value
      && x !== null                        // not a null value
      && x !== ''                          // not an empty string
      && !(_.isNaN(x))                         // not a NaN
      && !(_.isArray(x) && _.isEmpty(x))   // not an empty array
      && !(_.isObject(x) && _.isEmpty(x)); // not an empty object
  },
  // Not enough value to test a one line function, mainly an alias here.
  /* istanbul ignore next */
  isFalsy: function (x) {
    return !_.isTruthy(x);
  },
  isNonEmptyString: function (x) {
    return _.isString(x) && !_.isEmpty(x);
  },
  isNonEmptyArray: function (x) {
    return _.isArray(x) && !_.isEmpty(x);
  },
  hasSomeTruthyProps: function (x) {
    if (!_.isObject(x)) return false;
    if (_.isEmpty(x)) return false;
    return _.some(x, function (value) {
      return _.isTruthy(value);
    });
  },

  isNotInteger: function (x) {
    return !_.isInteger(x);
  },

  // See http://veerasundar.com/blog/2013/01/underscore-js-and-guid-function/
  guid: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

}, {chain: false});

export default _;
