import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({

  // Attributes
  name: attr(),
  type: attr(),
  logoUrl: attr(),
  externalId: attr(),
  provinceCode: attr(),
  isManagingStudents: attr(),
  credit: attr(),

  // Relationships
  memberships: hasMany('membership'),
  targetProfiles: DS.hasMany('target-profile'),

  // Functions
  async hasMember(userEmail) {
    const memberships = await this.memberships;
    return !!memberships.findBy('user.email', userEmail);
  }

});
