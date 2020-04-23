const BookshelfCompetenceMark = require('../data/competence-mark');
const CompetenceMark = require('../../domain/models/CompetenceMark');

function _toDomain(bookshelfCompetenceMark) {
  return new CompetenceMark(bookshelfCompetenceMark.attributes);
}

module.exports = {
  save: (competenceMark, domainTransaction = {}) => {
    return competenceMark.validate()
      .then(() => new BookshelfCompetenceMark(competenceMark).save(null, { transacting: domainTransaction.knexTransaction }))
      .then((savedCompetenceMark) => savedCompetenceMark.toDomainEntity());
  },

  findByAssessmentResultId(assessmentResultId) {
    return BookshelfCompetenceMark
      .where({ assessmentResultId })
      .fetchAll()
      .then((competenceMarks) => competenceMarks.models.map(_toDomain));
  },

};
