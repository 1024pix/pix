const Bookshelf = require('../bookshelf');

require('./target-profile');

const modelName = 'TargetProfileSkill';

module.exports = Bookshelf.model(modelName, {

  tableName: 'target-profiles_skills',
  requireFetch: false,

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

}, {
  modelName
});
