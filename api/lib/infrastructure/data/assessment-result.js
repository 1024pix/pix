const Bookshelf = require('../bookshelf');

require('./assessment');
require('./competence-mark');

module.exports = Bookshelf.model('AssessmentResults', {

  tableName: 'assessment-results',

  assessment() {
    return this.belongsTo('Assessments');
  },

  competenceMarks() {
    return this.hasMany('CompetenceMark', 'assessmentResultId');
  }

});
