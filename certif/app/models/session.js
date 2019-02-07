import DS from 'ember-data';

export default DS.Model.extend({
  address: DS.attr(),
  accessCode: DS.attr(),
  date: DS.attr(),
  description: DS.attr(),
  examiner: DS.attr(),
  room: DS.attr(),
  time: DS.attr(),
  certificationCenter: DS.belongsTo('certificationCenter'),
});
