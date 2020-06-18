const BookshelfCompetenceMark = require('../data/competence-mark');
const CompetenceMark = require('../../domain/models/CompetenceMark');

function _toDomain(bookshelfCompetenceMark) {
  return new CompetenceMark(bookshelfCompetenceMark.attributes);
}

module.exports = {
  async save(competenceMark, domainTransaction = {}) {
    await competenceMark.validate();
    const savedCompetenceMark = await new BookshelfCompetenceMark(competenceMark)
      .save(null, { transacting: domainTransaction.knexTransaction });
    return savedCompetenceMark.toDomainEntity();
  },

  async findByAssessmentResultId(assessmentResultId) {
    const competenceMarks = await BookshelfCompetenceMark
      .where({ assessmentResultId })
      .fetchAll();
    return competenceMarks.models.map(_toDomain);
  },
};
