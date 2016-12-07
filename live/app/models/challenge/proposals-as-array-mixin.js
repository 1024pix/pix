import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Mixin.create({
  _proposalsAsArray: Ember.computed('proposals', function () {
    if (_.isEmpty(this.get('proposals'))) {
      return [];
    }

    const proposals = '\n' + this.get('proposals');

    const elements = proposals.split(/\n\s*-\s*/);
    elements.shift();
    return elements;
  })
});


