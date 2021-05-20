const Bookshelf = require('../bookshelf');

const modelName = 'KnowledgeElementSnapshot';

module.exports = Bookshelf.model(modelName, {

  tableName: 'knowledge-element-snapshots',

}, {
  modelName,
});
