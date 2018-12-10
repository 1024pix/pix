import DS from 'ember-data';

export default DS.Model.extend({
  accessCode: DS.attr('string'),
  certificationCenter: DS.attr('string'),
  date: DS.attr('date'),
  description: DS.attr('string'),
  examiner: DS.attr('string'),
  room: DS.attr('string'),
  time: DS.attr('string'),
});
