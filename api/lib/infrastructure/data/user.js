const User = require('../../domain/models/User');
const PixRole = require('../../domain/models/PixRole');

const Bookshelf = require('../bookshelf');
const BookshelfPixRole = require('./pix-role');
const BookshelfUserPixRole = require('./user-pix-role');

require('./assessment');
require('./knowledge-element');
require('./membership');
require('./certification-center-membership');
require('./user-orga-settings');
require('./schooling-registration');
require('./authentication-method');

const modelName = 'User';

module.exports = Bookshelf.model(modelName, {

  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  assessments() {
    return this.hasMany('Assessment', 'userId');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'userId');
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

  schoolingRegistrations() {
    return this.hasMany('SchoolingRegistration', 'userId');
  },

  authenticationMethods() {
    return this.hasMany('AuthenticationMethod', 'userId');
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
  },

}, {
  modelName,
});
