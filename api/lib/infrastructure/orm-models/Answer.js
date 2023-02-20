import Bookshelf from '../bookshelf';

import './Assessment';

const modelName = 'Answer';

export default Bookshelf.model(
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
  }
);
