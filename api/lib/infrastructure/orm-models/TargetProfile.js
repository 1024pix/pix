const Bookshelf = require('../bookshelf.js');

require('./Badge.js');
require('./Stage.js');
require('./Organization.js');

const modelName = 'TargetProfile';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'target-profiles',
    hasTimestamps: ['createdAt', null],

    badges() {
      return this.hasMany('Badge', 'targetProfileId');
    },

    stages() {
      return this.hasMany('Stage', 'targetProfileId');
    },

    organizations() {
      return this.belongsToMany('Organization', 'target-profile-shares', 'targetProfileId', 'organizationId');
    },
  },
  {
    modelName,
  }
);
