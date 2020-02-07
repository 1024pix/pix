const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign-participation');
require('./organization');
require('./target-profile');
require('./user');

module.exports = Bookshelf.model('Campaign', {

  tableName: 'campaigns',
  hasTimestamps: ['createdAt', null],

  campaignParticipations() {
    return this.hasMany('CampaignParticipation', 'campaignId');
  },

  targetProfile: function() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },

  creator: function() {
    return this.belongsTo('User', 'creatorId');
  },
});
