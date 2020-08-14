const Bookshelf = require('../bookshelf');

require('./badge');
require('./stage');
require('./target-profile-skill');

const modelName = 'TargetProfile';

module.exports = Bookshelf.model(modelName, {

  tableName: 'target-profiles',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  skillIds() {
    return this.hasMany('TargetProfileSkill', 'targetProfileId');
  },

  badge() {
    return this.belongsTo('Badge', 'targetProfileId');
  },

  stages() {
    return this.hasMany('Stage', 'targetProfileId');
  },
}, {
  modelName
});
