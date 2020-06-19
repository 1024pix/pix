const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign-participation');
require('./organization');
require('./target-profile');
require('./user');

const modelName = 'Campaign';

module.exports = Bookshelf.model(modelName, {

  tableName: 'campaigns',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  campaignParticipations() {
    return this.hasMany('CampaignParticipation', 'campaignId');
  },

  targetProfile: function() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  creator: function() {
    return this.belongsTo('User', 'creatorId');
  },

}, {
  modelName
});
