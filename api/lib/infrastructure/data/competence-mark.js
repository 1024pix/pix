const Bookshelf = require('../bookshelf');
const CompetenceMark = require('../../domain/models/CompetenceMark');

require('./assessment-result');

const bookshelfName = 'CompetenceMark';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'competence-marks',
  bookshelfName,

  assessmentResults() {
    return this.belongsTo('AssessmentResult');
  },

  toDomainEntity() {
    const model = this.toJSON();
    return new CompetenceMark(model);
  }
});
