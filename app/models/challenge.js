import DS from 'ember-data';
import Ember from 'ember';
import _ from 'lodash/lodash';

export default DS.Model.extend({

  instruction: DS.attr('string'),
  proposals: DS.attr('string'),

  proposalsAsArray: Ember.computed('proposals', function () {
    const proposals = '\n' + this.get('proposals');

    if (_.isEmpty(proposals)) {
      return [];
    }

    let elements = proposals.split(/\n\s*-\s*/);
    elements.shift();
    return elements;
  })
});
