import Model, { attr } from '@ember-data/model';

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  birthdate: attr('date-only'),
  campaignCode: attr('string'),
  username: attr('string'),

});
