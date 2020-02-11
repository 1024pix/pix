const Bookshelf = require('../bookshelf');
const User = require('../../domain/models/User');
const PixRole = require('../../domain/models/PixRole');
const BookshelfPixRole = require('./pix-role');
const BookshelfUserPixRole = require('./user-pix-role');

require('./assessment');
require('./organization');
require('./knowledge-element');
require('./membership');
require('./certification-center-membership');
require('./user-orga-settings');

module.exports = Bookshelf.model('User', {
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessments() {
    return this.hasMany('Assessment', 'userId');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'userId');
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

  userOrgaSettings() {
    return this.hasOne('UserOrgaSettings', 'userId', 'id');
  },

  toDomainEntity() {
    const model = this.toJSON();
    if (model.pixRoles) {
      model.pixRoles = model.pixRoles.map((pixRoleJson) => new PixRole(pixRoleJson));
    }
    model.cgu = Boolean(model.cgu);
    model.pixOrgaTermsOfServiceAccepted = Boolean(model.pixOrgaTermsOfServiceAccepted);
    model.pixCertifTermsOfServiceAccepted = Boolean(model.pixCertifTermsOfServiceAccepted);
    model.hasSeenAssessmentInstructions = Boolean(model.hasSeenAssessmentInstructions);

    return new User(model);
  }

});
