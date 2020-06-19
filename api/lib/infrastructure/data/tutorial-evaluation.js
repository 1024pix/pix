const Bookshelf = require('../bookshelf');

const modelName = 'TutorialEvaluation';

module.exports = Bookshelf.model(modelName, {

  tableName: 'tutorial-evaluations',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

}, {
  modelName
});
