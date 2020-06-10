const Bookshelf = require('../bookshelf');

require('./assessment');
require('./user');

const modelName = 'CompetenceEvaluation';

module.exports = Bookshelf.model(modelName, {

  tableName: 'competence-evaluations',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

}, {
  modelName
});
