const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('TutorialEvaluation', {
  tableName: 'tutorial-evaluations',
  hasTimestamps: ['createdAt', 'updatedAt'],
});
