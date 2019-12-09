import DS from 'ember-data';
const { attr, hasMany, Model } = DS;

export default Model.extend({

  // Attributes
  firstName: attr(),
  lastName: attr(),
  email: attr(),

  // Relationships
  memberships: hasMany('membership'),

});
