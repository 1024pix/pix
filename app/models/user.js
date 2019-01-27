import DS from 'ember-data';

const { attr, hasMany } = DS;

export default DS.Model.extend({

  // Attributes
  firstName: attr(),
  lastName: attr(),
  email: attr(),

  // Relationships
  memberships: hasMany('membership'),

});
