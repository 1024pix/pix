const Bookshelf = require('../bookshelf.js');

require('./Assessment.js');
require('./User.js');

const modelName = 'CompetenceEvaluation';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'competence-evaluations',
    hasTimestamps: ['createdAt', 'updatedAt'],

    assessment() {
      return this.belongsTo('Assessment', 'assessmentId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },
  },
  {
    modelName,
  }
);
