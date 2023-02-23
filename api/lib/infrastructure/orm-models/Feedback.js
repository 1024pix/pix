const Bookshelf = require('../bookshelf.js');

require('./Assessment.js');

const modelName = 'Feedback';

module.exports = Bookshelf.model(
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
