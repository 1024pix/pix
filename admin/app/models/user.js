import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({

  // Attributes
  firstName: attr(),
  lastName: attr(),
  email: attr(),

  // Relationships
  memberships: hasMany('membership'),

});
