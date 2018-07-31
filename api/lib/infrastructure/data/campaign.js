const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');
require('./campaign-participation');
require('./assessment');

module.exports = Bookshelf.model('Campaign', {

  tableName: 'campaigns',

  campaignParticipations() {
    return this.hasMany('CampaignParticipation', 'campaignId');
  },

  assessments: function() {
    return this.belongsToMany('Assessment', 'campaingId').through('CampaignParticipation');
  }

});
