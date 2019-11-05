import DS from 'ember-data';
const { Model, attr } = DS;

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  birthdate: attr('date-only'),
  sessionId: attr('number'),
});
