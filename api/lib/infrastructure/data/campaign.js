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

}, {
  modelName,
});
