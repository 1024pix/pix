import { Model, belongsTo } from 'ember-cli-mirage';
import attr from 'ember-data/attr';

export default Model.extend({
  instruction: attr('string'),
  assessment: belongsTo('assessment')
});
