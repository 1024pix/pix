const Bookshelf = require('../bookshelf.js');

require('./Assessment.js');
require('./KnowledgeElement.js');
require('./Membership.js');
require('./CertificationCenterMembership.js');
require('./UserOrgaSettings.js');
require('./OrganizationLearner.js');
require('./AuthenticationMethod.js');

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

    memberships() {
      return this.hasMany('Membership', 'userId');
    },

    certificationCenterMemberships() {
      return this.hasMany('CertificationCenterMembership', 'userId');
    },

    userOrgaSettings() {
      return this.hasOne('UserOrgaSettings', 'userId', 'id');
    },

    organizationLearners() {
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
