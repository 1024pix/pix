const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign');

module.exports = Bookshelf.model('CampaignParticipation', {

  tableName: 'campaign-participations',

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  campaign() {
    return this.belongsTo('Campaign', 'campaignId');
  },
});
