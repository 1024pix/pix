import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  birthplace: DS.attr('string'),
  externalId: DS.attr('string'),
  extraTimePercentage: DS.attr('number'),
});
