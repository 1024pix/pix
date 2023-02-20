import Bookshelf from '../bookshelf';

import './Assessment';

const modelName = 'Feedback';

export default Bookshelf.model(
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
