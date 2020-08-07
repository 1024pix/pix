import _ from 'lodash';

_.mixin({

  // See http://stackoverflow.com/a/10834843
  /* istanbul ignore next */
  isStrictlyPositiveInteger: function(str) {
    return /^\+?[1-9]\d*$/.test(str);
  },

  isNumeric: function isNumeric(value) {
    if (typeof value === 'number') return true;
    const str = (value || '').toString();
    if (!str) return false;
    return !isNaN(str);
  },

}, { chain: false });

export default _;
