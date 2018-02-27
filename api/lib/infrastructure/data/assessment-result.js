const Bookshelf = require('../bookshelf');

require('./assessment');

module.exports = Bookshelf.model('AssessmentResults', {

  tableName: 'assessment-results',

  assessment() {
    return this.belongsTo('Assessments');
  },

  competenceMarks() {
    return this.hasMany('CompetenceMarks', 'assessmentResultId');
  }

});
