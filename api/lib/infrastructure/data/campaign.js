const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign-participation');
require('./organization');
require('./target-profile');
require('./user');

module.exports = Bookshelf.model('Campaign', {

  tableName: 'campaigns',

  campaignParticipations() {
    return this.hasMany('CampaignParticipation', 'campaignId');
  },

  assessments: function() {
    return this.belongsToMany('Assessment', 'campaingId').through('CampaignParticipation');
  },

  targetProfile: function() {
    return this.belongsTo('TargetProfile', 'targetProfileId');
  },
});
