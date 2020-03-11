import DS from 'ember-data';
const { attr, hasMany, Model } = DS;

export default Model.extend({

  // Attributes
  name: attr(),
  type: attr(),
  logoUrl: attr(),
  externalId: attr(),
  provinceCode: attr(),
  isManagingStudents: attr(),

  // Relationships
  memberships: hasMany('membership'),
  targetProfiles: DS.hasMany('target-profile'),

  // Functions
  async hasMember(userEmail) {
    const memberships = await this.memberships;
    return !!memberships.findBy('user.email', userEmail);
  }

});
