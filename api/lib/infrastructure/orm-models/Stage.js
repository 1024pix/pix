const Bookshelf = require('../bookshelf.js');

const modelName = 'Stage';
require('./TargetProfile.js');

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'stages',
    hasTimestamps: ['createdAt', 'updatedAt'],

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },
  },
  {
    modelName,
  }
);
