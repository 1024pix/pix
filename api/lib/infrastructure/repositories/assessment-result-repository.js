const _ = require('lodash');
const BookshelfAssessmentResult = require('../data/assessment-result');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../bookshelf');
const { MissingAssessmentId, AssessmentResultNotCreatedError } = require('../../domain/errors');
const DomainTransaction = require('../DomainTransaction');

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
  }, domainTransaction = DomainTransaction.emptyTransaction()) {
    if (_.isNil(assessmentId)) {
      throw new MissingAssessmentId();
    }
    try {
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
        .save(null, { require: true, transacting: domainTransaction.knexTransaction });

      return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, savedAssessmentResultBookshelf);
    } catch (error) {
      throw new AssessmentResultNotCreatedError();
    }
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
      .fetch({ require: false, withRelated: ['competenceMarks'] });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessmentResult, latestAssessmentResultBookshelf);
  },
};
