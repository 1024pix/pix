import DS from 'ember-data';

const { attr, hasMany } = DS;

export default DS.Model.extend({
  firstName: attr(),
  lastName: attr(),
  email: attr(),
  memberships: hasMany('membership'),
});
