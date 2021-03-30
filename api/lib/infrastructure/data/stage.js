const Bookshelf = require('../bookshelf');

const modelName = 'Stage';
require('./target-profile');

module.exports = Bookshelf.model(modelName, {

  tableName: 'stages',
  hasTimestamps: ['createdAt', 'updatedAt'],

  targetProfile() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

}, {
  modelName,
});
