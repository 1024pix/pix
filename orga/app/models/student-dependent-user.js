import DS from 'ember-data';

export default DS.Model.extend({
  organizationId: DS.attr('number'),
  studentId: DS.attr('number'),
  password: DS.attr('string'),
});
