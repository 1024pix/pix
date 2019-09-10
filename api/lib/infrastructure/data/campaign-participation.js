const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign');
require('./user');

module.exports = Bookshelf.model('CampaignParticipation', {

  tableName: 'campaign-participations',
  hasTimestamps: ['createdAt', null],

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  campaign() {
    return this.belongsTo('Campaign', 'campaignId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

  parse(rawAttributes) {
    if (rawAttributes && rawAttributes.sharedAt) {
      rawAttributes.sharedAt = new Date(rawAttributes.sharedAt);
    }

    return rawAttributes;
  },
});
