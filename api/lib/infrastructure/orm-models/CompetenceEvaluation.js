import Bookshelf from '../bookshelf';

import './Assessment';
import './User';

const modelName = 'CompetenceEvaluation';

export default Bookshelf.model(
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
  }
);
