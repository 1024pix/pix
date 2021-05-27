const Bookshelf = require('../bookshelf');
const BookshelfPixRole = require('./PixRole');
const BookshelfUserPixRole = require('./UserPixRole');

require('./Assessment');
require('./KnowledgeElement');
require('./Membership');
require('./CertificationCenterMembership');
require('./UserOrgaSettings');
require('./SchoolingRegistration');
require('./AuthenticationMethod');

const modelName = 'User';

module.exports = Bookshelf.model(modelName, {

  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],

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
}, {
  modelName,
});
