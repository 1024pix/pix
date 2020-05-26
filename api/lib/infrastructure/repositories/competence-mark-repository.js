const DomainTransaction = require('../DomainTransaction');
const BookshelfCompetenceMark = require('../data/competence-mark');
const CompetenceMark = require('../../domain/models/CompetenceMark');
const BookshelfAssessmentResult = require('../data/assessment-result');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

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

  async getLatestByCertificationCourseId({ certificationCourseId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const mostRecentAssessmentResultId = await BookshelfAssessmentResult
      .where({ 'assessments.certificationCourseId': certificationCourseId })
      .query((qb) => {
        qb.innerJoin('assessments', 'assessments.id', 'assessment-results.assessmentId');
      })
      .orderBy('assessment-results.createdAt', 'desc')
      .fetch({ require: true, columns: ['assessment-results.id'], transacting: domainTransaction.knexTransaction });

    const mostRecentCompetenceMarksBookshelf = await BookshelfCompetenceMark
      .where({ assessmentResultId: mostRecentAssessmentResultId.id })
      .fetchAll({ transacting: domainTransaction.knexTransaction });

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfCompetenceMark, mostRecentCompetenceMarksBookshelf);
  }

};
