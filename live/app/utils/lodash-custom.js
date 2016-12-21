import _ from 'lodash/lodash';

_.mixin({

  // Simple alias for includes, last arg fromIndex excluded.
  // Therefore, no test on this function.
  /* istanbul ignore next */
  isAmongst: function(element, collection) {
    return _.includes(collection, element);
  }
}, {chain: false});

export default _;
