import DS from 'ember-data';

export default DS.Model.extend({
  lastName: DS.attr('string'),
  firstName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  campaignCode: DS.attr('string'),
  email: DS.attr('string'),
  username: DS.attr('string'),
  password: DS.attr('string'),
  withUsername: DS.attr('boolean'),
});
