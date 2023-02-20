import Bookshelf from '../bookshelf';

import './Answer';
import './User';
import './KnowledgeElement';
import './CampaignParticipation';

const modelName = 'Assessment';

export default Bookshelf.model(
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
