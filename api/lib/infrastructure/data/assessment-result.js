const Bookshelf = require('../bookshelf');

require('./assessment');
require('./competence-mark');

module.exports = Bookshelf.model('AssessmentResult', {

  tableName: 'assessment-results',

  validations: {
    status: [
      {
        method: 'isIn',
        error: 'Le status de la certification n\'est pas valide',
        args: ['validated', 'rejected', 'pending', 'error']
      },
    ],
  },

  assessment() {
    return this.belongsTo('Assessments');
  },

  competenceMarks() {
    return this.hasMany('CompetenceMark', 'assessmentResultId');
  }

});
