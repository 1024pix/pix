import Model, { attr } from '@ember-data/model';

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  birthdate: attr('date-only'),
  campaignCode: attr('string'),
  email: attr('string'),
  username: attr('string'),
  password: attr('string'),
  withUsername: attr('boolean'),
});
