import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';

function calculate(proposals) {
  return _.chain(proposals)
            .thru((e) => '\n' + e)
            .split(/\n\s*-\s*/)
            .removeFirstElement()
            .value();
}

export default Ember.Mixin.create({
  _proposalsAsArray: Ember.computed('proposals', function() {

    const proposals = this.get('proposals');
    const DEFAULT_RETURN_VALUE = [];

    // check pre-conditions
    if (_(proposals).isNotString()) return DEFAULT_RETURN_VALUE;
    if (_(proposals).isEmpty()) return DEFAULT_RETURN_VALUE;

    return calculate(proposals);
  })
});

