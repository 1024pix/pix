import DS from 'ember-data';

export default DS.Model.extend({
  user: DS.belongsTo('user'),
  certificationCenter: DS.belongsTo('certificationCenter')
});
