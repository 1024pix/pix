import Model, { attr, belongsTo } from '@ember-data/model';

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  birthdate: attr('date-only'),
  user: belongsTo('user')
});
