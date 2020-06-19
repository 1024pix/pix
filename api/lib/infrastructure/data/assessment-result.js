const Bookshelf = require('../bookshelf');

require('./assessment');
require('./competence-mark');

const modelName = 'AssessmentResult';

module.exports = Bookshelf.model(modelName, {

  tableName: 'assessment-results',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  validations: {
    status: [
      {
        method: 'isIn',
        error: 'Le status de la certification n\'est pas valide',
        args: ['validated', 'rejected', 'error']
      },
    ],
  },

  assessment() {
    return this.belongsTo('Assessments');
  },

  competenceMarks() {
    return this.hasMany('CompetenceMark', 'assessmentResultId');
  },

}, {
  modelName
});
