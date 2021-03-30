const Bookshelf = require('../bookshelf');

require('./badge');
require('./stage');
require('./target-profile-skill');
require('./organization');

const modelName = 'TargetProfile';

module.exports = Bookshelf.model(modelName, {

  tableName: 'target-profiles',
  hasTimestamps: ['createdAt', null],

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  badges() {
    return this.hasMany('Badge', 'targetProfileId');
  },

  stages() {
    return this.hasMany('Stage', 'targetProfileId');
  },

  organizations() {
    return this.belongsToMany('Organization', 'target-profile-shares', 'targetProfileId', 'organizationId');
  },
}, {
  modelName,
});
