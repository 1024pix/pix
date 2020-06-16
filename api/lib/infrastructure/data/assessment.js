const Bookshelf = require('../bookshelf');

require('./answer');
require('./user');
require('./knowledge-element');
require('./campaign-participation');

module.exports = Bookshelf.model('Assessment', {

  tableName: 'assessments',
  hasTimestamps: ['createdAt', 'updatedAt'],

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'assessmentId');
  },

  campaignParticipation() {
    return this.belongsTo('CampaignParticipation', 'campaignParticipationId');
  },

});
