const Bookshelf = require('../bookshelf');

require('./assessment');
require('./competence-mark');

const bookshelfName = 'AssessmentResult';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'assessment-results',
  bookshelfName,

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
