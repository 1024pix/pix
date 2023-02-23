const Bookshelf = require('../bookshelf.js');

const modelName = 'KnowledgeElementSnapshot';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'knowledge-element-snapshots',
  },
  {
    modelName,
  }
);
