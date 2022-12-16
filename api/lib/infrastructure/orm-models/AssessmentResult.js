const Bookshelf = require('../bookshelf');

require('./Assessment');
require('./CompetenceMark');

const modelName = 'AssessmentResult';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'assessment-results',
    hasTimestamps: ['createdAt', null],

    validations: {
      status: [
        {
          method: 'isIn',
          error: "Le status de la certification n'est pas valide",
          args: ['validated', 'rejected', 'error', 'cancelled'],
        },
      ],
    },

    assessment() {
      return this.belongsTo('Assessments');
    },

    competenceMarks() {
      return this.hasMany('CompetenceMark', 'assessmentResultId');
    },
  },
  {
    modelName,
  }
);
