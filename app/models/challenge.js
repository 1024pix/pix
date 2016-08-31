import DS from 'ember-data';
import Ember from 'ember';
import _ from 'lodash/lodash';

const { Model, attr, belongsTo } = DS;
const { computed } = Ember;

export default Model.extend({

  instruction: attr('string'),
  proposals: attr('string'),
  illustrationUrl: attr('string'),

  proposalsAsArray: computed('proposals', function () {
    if (_.isEmpty(this.get('proposals'))) {
      return [];
    }

    const proposals = '\n' + this.get('proposals');

    let elements = proposals.split(/\n\s*-\s*/);
    elements.shift();
    return elements;
  })
});
