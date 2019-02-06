const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign-participation');
require('./organization');
require('./target-profile');
require('./user');

const bookshelfName = 'Campaign';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'campaigns',
  bookshelfName,

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
