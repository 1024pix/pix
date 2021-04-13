const _ = require('lodash');
const BookshelfAssessmentResult = require('../data/assessment-result');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../bookshelf');
const { MissingAssessmentId, AssessmentResultNotCreatedError } = require('../../domain/errors');
const DomainTransaction = require('../DomainTransaction');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const CompetenceMark = require('../../domain/models/CompetenceMark');

function _toDomain({ assessmentResultDTO, competencesMarksDTO }) {
  const competenceMarks = competencesMarksDTO.map(
    (competenceMark) => new CompetenceMark(competenceMark),
  );

  return new AssessmentResult({
    id: assessmentResultDTO.id,
    assessmentId: assessmentResultDTO.assessmentId,
    status: assessmentResultDTO.status,
    commentForCandidate: assessmentResultDTO.commentForCandidate,
    commentForOrganization: assessmentResultDTO.commentForOrganization,
    commentForJury: assessmentResultDTO.commentForJury,
    createdAt: assessmentResultDTO.createdAt,
    emitter: assessmentResultDTO.emitter,
    juryId: assessmentResultDTO.juryId,
    pixScore: assessmentResultDTO.pixScore,
    competenceMarks: competenceMarks,
  });
}

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

  async getByCertificationCourseId({ certificationCourseId }) {
    const assessment = await knex('assessments')
      .select('id')
      .where({ certificationCourseId })
      .orderBy('createdAt', 'desc')
      .first();

    if (assessment) {
      const assessmentId = assessment.id;

      const latestAssessmentResult = await knex('assessment-results')
        .where({ assessmentId })
        .orderBy('createdAt', 'desc')
        .first();

      if (latestAssessmentResult) {
        const competencesMarksDTO = await knex('competence-marks')
          .where({ assessmentResultId: latestAssessmentResult.id });

        return _toDomain({
          assessmentResultDTO: latestAssessmentResult,
          competencesMarksDTO,
        });
      }

      return AssessmentResult.buildStartedAssessmentResult({ assessmentId });
    }
    return AssessmentResult.buildStartedAssessmentResult({ assessmentId: null });
  },
};
