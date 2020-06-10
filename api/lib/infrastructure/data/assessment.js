const Bookshelf = require('../bookshelf');

require('./answer');
require('./user');
require('./knowledge-element');
require('./campaign-participation');

const modelName = 'Assessment';

module.exports = Bookshelf.model(modelName, {

  tableName: 'assessments',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  answers() {
    return this.hasMany('Answer', 'assessmentId');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'assessmentId');
  },

  campaignParticipation() {
    return this.belongsTo('CampaignParticipation', 'campaignParticipationId');
  },

}, {
  modelName
});
