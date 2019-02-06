const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign');

const bookshelfName = 'CampaignParticipation';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'campaign-participations',
  bookshelfName,

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  campaign() {
    return this.belongsTo('Campaign', 'campaignId');
  },
});
