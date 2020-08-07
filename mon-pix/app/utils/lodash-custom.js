import _ from 'lodash';

_.mixin({

  // See http://stackoverflow.com/a/10834843
  /* istanbul ignore next */
  isStrictlyPositiveInteger: function(str) {
    return /^\+?[1-9]\d*$/.test(str);
  },

}, { chain: false });

export default _;
