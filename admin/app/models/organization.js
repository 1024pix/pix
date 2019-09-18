import DS from 'ember-data';

const { attr, hasMany } = DS;

export default DS.Model.extend({

  // Attributes
  name: attr(),
  type: attr(),
  code: attr(),
  logoUrl: attr(),
  externalId: attr(),
  provinceCode: attr(),

  // Relationships
  memberships: hasMany('membership'),

  // Functions
  async hasMember(userEmail) {
    const memberships = await this.memberships;
    return !!memberships.findBy('user.email', userEmail);
  }

});
