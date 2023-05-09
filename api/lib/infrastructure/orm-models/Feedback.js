import { Bookshelf } from '../bookshelf.js';

import './Assessment.js';

const modelName = 'Feedback';

const BookshelfFeedback = Bookshelf.model(
  modelName,
  {
    tableName: 'feedbacks',
    hasTimestamps: ['createdAt', 'updatedAt'],

    assessment() {
      return this.belongsTo('Assessment');
    },
  },
  {
    modelName,
  }
);

export { BookshelfFeedback };
