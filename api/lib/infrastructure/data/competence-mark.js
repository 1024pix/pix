const Bookshelf = require('../bookshelf');

require('./assessment-results');

module.exports = Bookshelf.model('CompetenceMark', {

  tableName: 'competence-marks',

  assessmentResults() {
    return this.belongsTo('AssessmentResults');
  }
});
