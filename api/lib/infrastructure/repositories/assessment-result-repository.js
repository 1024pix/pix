const BookshelfAssessmentResult = require('../data/assessment-result');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {
  async save({
    pixScore,
    level,
    status,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    id,
    juryId,
    assessmentId,
  }, domainTransaction = {}) {
    const savedAssessmentResultBookshelf = await new BookshelfAssessmentResult({
      pixScore,
      level,
      status,
      emitter,
      commentForJury,
      commentForCandidate,
      commentForOrganization,
      id,
      juryId,
      assessmentId,
    })
      .save(null, { transacting: domainTransaction.knexTransaction });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, savedAssessmentResultBookshelf);
  },

  async findLatestByAssessmentId({ assessmentId, limitDate }) {
    const latestAssessmentResultBookshelf = await BookshelfAssessmentResult
      .where((qb) => {
        qb.where({ assessmentId });
        if (limitDate) {
          qb.where('createdAt', '<', limitDate);
        }
      })
      .orderBy('createdAt', 'desc')
      .fetch({ withRelated: ['competenceMarks'] });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, latestAssessmentResultBookshelf);
  },

  async findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId }) {
    const latestAssessmentResultBookshelf = await BookshelfAssessmentResult
      .query((qb) => {
        qb.join('assessments', 'assessments.id', 'assessment-results.assessmentId');
        qb.where('assessments.certificationCourseId', '=', certificationCourseId);
      })
      .orderBy('createdAt', 'desc')
      .fetch({ withRelated: ['competenceMarks'] });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, latestAssessmentResultBookshelf);
  }
};
