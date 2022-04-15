const Bookshelf = require('../bookshelf');

require('./Assessment');
require('./KnowledgeElement');
require('./Membership');
require('./PixAdminRole');
require('./CertificationCenterMembership');
require('./UserOrgaSettings');
require('./OrganizationLearner');
require('./AuthenticationMethod');

const modelName = 'User';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'users',
    hasTimestamps: ['createdAt', 'updatedAt'],

    assessments() {
      return this.hasMany('Assessment', 'userId');
    },

    knowledgeElements() {
      return this.hasMany('KnowledgeElement', 'userId');
    },

    pixAdminRoles() {
      return this.hasMany('PixAdminRole', 'userId');
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
      return this.hasMany('OrganizationLearner', 'userId');
    },

    authenticationMethods() {
      return this.hasMany('AuthenticationMethod', 'userId');
    },
  },
  {
    modelName,
  }
);
