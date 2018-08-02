import DS from 'ember-data';

export default DS.Model.extend({
  user: DS.belongsTo('user'),
  organization: DS.belongsTo('organization')
});
