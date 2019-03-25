const Bookshelf = require('../bookshelf');
const BookshelfPixRole = require('./pix-role');
const BookshelfUserPixRole = require('./user-pix-role');

require('./assessment');
require('./organization');
require('./membership');

module.exports = Bookshelf.model('User', {
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessments() {
    return this.hasMany('Assessment');
  },

  /**
   * @deprecated Please use #organizationsAccesses() which also manages the access rights
   */
  organizations() {
    return this.hasMany('Organization', 'userId');
  },

  pixRoles() {
    return this.belongsToMany(BookshelfPixRole).through(BookshelfUserPixRole);
  },

  memberships() {
    return this.hasMany('Membership', 'userId');
  },

  certificationCenterMemberships() {
    return this.hasMany('CertificationCenterMembership', 'userId');
  },

  parse(rawAttributes) {
    if('cgu' in rawAttributes) {
      rawAttributes.cgu = Boolean(rawAttributes.cgu);
    }
    if('pixOrgaTermsOfServiceAccepted' in rawAttributes && rawAttributes.pixOrgaTermsOfServiceAccepted !== null) {
      rawAttributes.pixOrgaTermsOfServiceAccepted = Boolean(rawAttributes.pixOrgaTermsOfServiceAccepted);
    }
    if('pixCertifTermsOfServiceAccepted' in rawAttributes && rawAttributes.pixCertifTermsOfServiceAccepted !== null) {
      rawAttributes.pixCertifTermsOfServiceAccepted = Boolean(rawAttributes.pixCertifTermsOfServiceAccepted);
    }

    return rawAttributes;
  },

});
