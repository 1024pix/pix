import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({
  name: attr(),
  email: attr(),
  type: attr(),
  code: attr(),
  user: belongsTo('user'),
});
