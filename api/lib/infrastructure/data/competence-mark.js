const Bookshelf = require('../bookshelf');
const CompetenceMark = require('../../domain/models/CompetenceMark');

require('./assessment-result');

module.exports = Bookshelf.model('CompetenceMark', {

  tableName: 'competence-marks',

  assessmentResults() {
    return this.belongsTo('AssessmentResults');
  },

  toDomainEntity() {
    const model = this.toJSON();
    return new CompetenceMark(model);
  }
});
