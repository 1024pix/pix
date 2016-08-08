import DS from 'ember-data';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default DS.Model.extend({
  instruction: attr('string'),
  assessment: belongsTo('assessment'),
  number: attr('number') // e.g. challenge 1 of 5
});
