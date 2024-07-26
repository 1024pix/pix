import './Assessment.js';
import './User.js';

import { Bookshelf } from '../bookshelf.js';

const modelName = 'KnowledgeElement';

const BookshelfKnowledgeElement = Bookshelf.model(
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
  },
);

export { BookshelfKnowledgeElement };
