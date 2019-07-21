import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  birthdate: attr('string'),
  birthCity: attr('string'),
  birthProvince: attr('string'),
  birthCountry: attr('string'),
  externalId: attr('string'),
  extraTimePercentage: attr('number'),
  session: belongsTo('session'),
});
