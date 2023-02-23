const Bookshelf = require('../bookshelf.js');

require('./Answer.js');
require('./User.js');
require('./KnowledgeElement.js');
require('./CampaignParticipation.js');

const modelName = 'Assessment';

module.exports = Bookshelf.model(
  modelName,
  {
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
  },
  {
    modelName,
  }
);
