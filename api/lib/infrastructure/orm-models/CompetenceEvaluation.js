import './Assessment.js';
import './User.js';

import { Bookshelf } from '../bookshelf.js';

const modelName = 'CompetenceEvaluation';

const BookshelfCompetenceEvaluation = Bookshelf.model(
  modelName,
  {
    tableName: 'competence-evaluations',
    hasTimestamps: ['createdAt', 'updatedAt'],

    assessment() {
      return this.belongsTo('Assessment', 'assessmentId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },
  },
  {
    modelName,
  },
);

export { BookshelfCompetenceEvaluation };
