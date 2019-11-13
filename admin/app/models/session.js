import DS from 'ember-data';

export default DS.Model.extend({
  certificationCenter: DS.attr(),
  address: DS.attr(),
  room: DS.attr(),
  examiner: DS.attr(),
  date: DS.attr('date-only'),
  time: DS.attr(),
  description: DS.attr(),
  accessCode: DS.attr(),
  certifications: DS.hasMany('certification')
});
