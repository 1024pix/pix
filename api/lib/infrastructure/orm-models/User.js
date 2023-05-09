import { Bookshelf } from '../bookshelf.js';

import './Assessment.js';
import './KnowledgeElement.js';
import './Membership.js';
import './CertificationCenterMembership.js';
import './UserOrgaSettings.js';
import './OrganizationLearner.js';
import './AuthenticationMethod.js';

const modelName = 'User';

const BookshelfUser = Bookshelf.model(
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

export { BookshelfUser };
