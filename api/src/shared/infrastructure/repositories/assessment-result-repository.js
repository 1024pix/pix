import _ from 'lodash';
import { knex } from '../../../../db/knex-database-connection.js';
import { AssessmentResultNotCreatedError, MissingAssessmentId } from '../../domain/errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../../lib/domain/models/CompetenceMark.js';

function _toDomain({ assessmentResultDTO, competencesMarksDTO }) {
  const competenceMarks = competencesMarksDTO.map((competenceMark) => new CompetenceMark(competenceMark));

  const reproducibilityRateAsNumber = _.toNumber(assessmentResultDTO.reproducibilityRate) ?? null;
  return new AssessmentResult({
    id: assessmentResultDTO.id,
    assessmentId: assessmentResultDTO.assessmentId,
    status: assessmentResultDTO.status,
    commentForCandidate: assessmentResultDTO.commentForCandidate,
    commentForOrganization: assessmentResultDTO.commentForOrganization,
    commentForJury: assessmentResultDTO.commentByJury,
    createdAt: assessmentResultDTO.createdAt,
    emitter: assessmentResultDTO.emitter,
    juryId: assessmentResultDTO.juryId,
    pixScore: assessmentResultDTO.pixScore,
    reproducibilityRate: reproducibilityRateAsNumber,
    competenceMarks: competenceMarks,
  });
}

const save = async function ({
  certificationCourseId,
  assessmentResult,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const {
    pixScore,
    reproducibilityRate,
    status,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    id,
    juryId,
    assessmentId,
  } = assessmentResult;

  const knexConn = domainTransaction.knexTransaction || knex;
  if (_.isNil(assessmentId)) {
    throw new MissingAssessmentId();
  }
  try {
    const [savedAssessmentResultData] = await knexConn('assessment-results')
      .insert({
        pixScore,
        reproducibilityRate,
        status,
        emitter,
        commentByJury: commentForJury,
        commentForCandidate,
        commentForOrganization,
        id,
        juryId,
        assessmentId,
      })
      .returning('*');

    await knex('certification-courses-last-assessment-results')
      .insert({ certificationCourseId, lastAssessmentResultId: savedAssessmentResultData.id })
      .onConflict('certificationCourseId')
      .merge(['lastAssessmentResultId']);

    const savedAssessmentResult = new AssessmentResult({
      id: savedAssessmentResultData.id,
      createdAt: savedAssessmentResultData.createdAt,
      level: savedAssessmentResultData.level,
      pixScore: savedAssessmentResultData.pixScore,
      emitter: savedAssessmentResultData.emitter,
      commentForJury: savedAssessmentResultData.commentByJury,
      commentForOrganization: savedAssessmentResultData.commentForOrganization,
      commentForCandidate: savedAssessmentResultData.commentForCandidate,
      status: savedAssessmentResultData.status,
      juryId: savedAssessmentResultData.juryId,
      assessmentId: savedAssessmentResultData.assessmentId,
      reproducibilityRate: _.toNumber(savedAssessmentResultData.reproducibilityRate) ?? null,
      commentByAutoJury: savedAssessmentResultData.commentByAutoJury,
    });
    return savedAssessmentResult;
  } catch (error) {
    throw new AssessmentResultNotCreatedError();
  }
};

const findLatestLevelAndPixScoreByAssessmentId = async function ({ assessmentId, limitDate }) {
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
};

const getByCertificationCourseId = async function ({ certificationCourseId }) {
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
      const competencesMarksDTO = await knex('competence-marks').where({
        assessmentResultId: latestAssessmentResult.id,
      });

      return _toDomain({
        assessmentResultDTO: latestAssessmentResult,
        competencesMarksDTO,
      });
    }

    return AssessmentResult.buildStartedAssessmentResult({ assessmentId });
  }
  return AssessmentResult.buildStartedAssessmentResult({ assessmentId: null });
};

export { save, findLatestLevelAndPixScoreByAssessmentId, getByCertificationCourseId };
