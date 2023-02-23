const Bookshelf = require('../bookshelf.js');

require('./Assessment.js');
require('./CampaignParticipation.js');
require('./Organization.js');
require('./TargetProfile.js');
require('./User.js');

const modelName = 'Campaign';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'campaigns',
    hasTimestamps: ['createdAt', null],

    organization() {
      return this.belongsTo('Organization', 'organizationId');
    },

    campaignParticipations() {
      return this.hasMany('CampaignParticipation', 'campaignId');
    },

    targetProfile() {
      return this.belongsTo('TargetProfile', 'targetProfileId');
    },

    creator() {
      return this.belongsTo('User', 'creatorId');
    },
  },
  {
    modelName,
  }
);
