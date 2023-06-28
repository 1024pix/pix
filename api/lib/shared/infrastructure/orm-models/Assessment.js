import { Bookshelf } from '../bookshelf.js';

import './Answer.js';
import './User.js';
import './KnowledgeElement.js';
import './CampaignParticipation.js';

const modelName = 'Assessment';

const BookshelfAssessment = Bookshelf.model(
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

export { BookshelfAssessment };
