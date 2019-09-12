import DS from 'ember-data';

export default DS.Model.extend({
  content: DS.attr('string'),
  category: DS.attr('string'),
  answer: DS.attr('string'),
  assessment: DS.belongsTo('assessment'),
  challenge: DS.belongsTo('challenge')
});
