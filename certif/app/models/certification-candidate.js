import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  birthCity: DS.attr('string'),
  birthProvinceCode: DS.attr('string'),
  birthCountry: DS.attr('string'),
  email: DS.attr('string'),
  externalId: DS.attr('string'),
  extraTimePercentage: DS.attr('number'),
  isLinked: DS.attr('boolean'),
});
