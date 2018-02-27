const Bookshelf = require('../bookshelf');

require('./assessment-result');

module.exports = Bookshelf.model('CompetenceMark', {

  tableName: 'competence-marks',

  assessmentResults() {
    return this.belongsTo('AssessmentResults');
  }
});
