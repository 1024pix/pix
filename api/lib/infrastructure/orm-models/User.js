import Bookshelf from '../bookshelf';

import './Assessment';
import './KnowledgeElement';
import './Membership';
import './CertificationCenterMembership';
import './UserOrgaSettings';
import './OrganizationLearner';
import './AuthenticationMethod';

const modelName = 'User';

export default Bookshelf.model(
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
