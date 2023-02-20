import Bookshelf from '../bookshelf';

import './Assessment';
import './User';

const modelName = 'KnowledgeElement';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'knowledge-elements',
    hasTimestamps: ['createdAt', null],

    assessment() {
      return this.belongsTo('Assessment', 'assessmentId');
    },

    user() {
      return this.belongsTo('User');
    },
  },
  {
    modelName,
  }
);
