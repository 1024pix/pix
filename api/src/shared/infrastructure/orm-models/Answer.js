import './Assessment.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'Answer';

const BookshelfAnswer = Bookshelf.model(
  modelName,
  {
    tableName: 'answers',
    hasTimestamps: ['createdAt', 'updatedAt'],

    assessment() {
      return this.belongsTo('Assessment');
    },
  },
  {
    modelName,
  },
);

export { BookshelfAnswer };
