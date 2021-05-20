const Bookshelf = require('../bookshelf');

require('./Assessment');
require('./User');

const modelName = 'CompetenceEvaluation';

module.exports = Bookshelf.model(modelName, {

  tableName: 'competence-evaluations',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

}, {
  modelName,
});
