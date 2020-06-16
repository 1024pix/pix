const _ = require('lodash');
const BookshelfAssessmentResult = require('../data/assessment-result');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../bookshelf');

module.exports = {
  async save({
    pixScore,
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

  async findLatestLevelAndPixScoreByAssessmentId({ assessmentId, limitDate }) {
    const result = await knex('assessment-results')
      .select('level', 'pixScore')
      .where((qb) => {
        qb.where({ assessmentId });
        if (limitDate) {
          qb.where('createdAt', '<', limitDate);
        }
      })
      .orderBy('createdAt', 'desc')
      .first();

    return {
      level: _.get(result, 'level', 0),
      pixScore: _.get(result, 'pixScore', 0),
    };
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
