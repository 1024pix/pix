const Bookshelf = require('../bookshelf');

require('./Assessment');
require('./User');

const modelName = 'KnowledgeElement';

module.exports = Bookshelf.model(
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
