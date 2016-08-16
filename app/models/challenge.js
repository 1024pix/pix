import DS from 'ember-data';
import attr from 'ember-data/attr';
import Ember from 'ember';
import _ from 'lodash';

export default DS.Model.extend({

  instruction: attr('string'),
  proposals: attr('string'),

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
