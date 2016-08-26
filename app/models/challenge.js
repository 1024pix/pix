import DS from 'ember-data';
import Ember from 'ember';
import _ from 'lodash/lodash';

const { Model, attr, belongsTo } = DS;
const { computed } = Ember;

export default Model.extend({

  instruction: attr('string'),
  proposals: attr('string'),

  proposalsAsArray: computed('proposals', function () {
    const proposals = '\n' + this.get('proposals');

    if (_.isEmpty(proposals)) {
      return [];
    }

    let elements = proposals.split(/\n\s*-\s*/);
    elements.shift();
    return elements;
  })
});
