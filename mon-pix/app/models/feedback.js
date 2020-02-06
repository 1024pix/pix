import Model, { attr, belongsTo } from '@ember-data/model';

export default Model.extend({
  content: attr('string'),
  category: attr('string'),
  answer: attr('string'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge')
});
