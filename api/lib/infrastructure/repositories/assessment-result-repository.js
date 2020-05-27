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

  async get(id) {
    const assessmentResultBookshelf = await BookshelfAssessmentResult
      .where('id', id)
      .fetch({ withRelated: ['competenceMarks'] });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, assessmentResultBookshelf);
  },

  async findLatestByAssessmentId(assessmentId) {
    const latestAssessmentResultBookshelf = await BookshelfAssessmentResult
      .where({ assessmentId })
      .orderBy('createdAt', 'desc')
      .fetch({ withRelated: ['competenceMarks'] });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, latestAssessmentResultBookshelf);
  }
};
