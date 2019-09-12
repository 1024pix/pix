import DS from 'ember-data';

export default DS.Model.extend({
  lastName: DS.attr('string'),
  firstName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  organization: DS.belongsTo('organization'),
});
