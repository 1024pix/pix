const BookshelfCompetenceMark = require('../data/competence-mark');
const CompetenceMark = require('../../domain/models/CompetenceMark');

function _toDomain(bookshelfCompetenceMark) {
  return new CompetenceMark(bookshelfCompetenceMark.attributes);
}

module.exports = {
  save: (competenceMark) => {
    return competenceMark.validate()
      .then(() => new BookshelfCompetenceMark(competenceMark).save())
      .then(savedCompetenceMark => savedCompetenceMark.toDomainEntity());
  },

  findByAssessmentResultId(assessmentResultId) {
    return BookshelfCompetenceMark
      .where({ assessmentResultId })
      .fetchAll()
      .then(challenges => challenges.models.map(_toDomain));
  },

};
