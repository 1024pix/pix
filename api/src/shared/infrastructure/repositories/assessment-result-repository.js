import _ from 'lodash';
import { knex } from '../../../../db/knex-database-connection.js';
import { AssessmentResultNotCreatedError, MissingAssessmentId } from '../../domain/errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../../lib/domain/models/CompetenceMark.js';
import { JuryComment, JuryCommentContexts } from '../../../certification/shared/domain/models/JuryComment.js';

function _toDomain({ assessmentResultDTO, competencesMarksDTO }) {
  const competenceMarks = competencesMarksDTO.map((competenceMark) => new CompetenceMark(competenceMark));
  const reproducibilityRateAsNumber = _.toNumber(assessmentResultDTO.reproducibilityRate) ?? null;
  const commentForOrganization = new JuryComment({
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    fallbackComment: assessmentResultDTO.commentForOrganization,
    context: JuryCommentContexts.ORGANIZATION,
  });
  const commentForCandidate = new JuryComment({
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    fallbackComment: assessmentResultDTO.commentForCandidate,
    context: JuryCommentContexts.CANDIDATE,
  });
  return new AssessmentResult({
    id: assessmentResultDTO.id,
    assessmentId: assessmentResultDTO.assessmentId,
    status: assessmentResultDTO.status,
    commentForCandidate,
    commentByJury: assessmentResultDTO.commentByJury,
    commentForOrganization,
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
  const { pixScore, reproducibilityRate, status, emitter, commentByJury, id, juryId, assessmentId } = assessmentResult;
  const commentByAutoJury = _getCommentByAutoJury(assessmentResult);

  if (_.isNil(assessmentId)) {
    throw new MissingAssessmentId();
  }
  try {
    const knexConn = domainTransaction.knexTransaction || knex;
    const [savedAssessmentResultData] = await knexConn('assessment-results')
      .insert({
        pixScore,
        reproducibilityRate,
        status,
        emitter,
        commentByJury,
        id,
        juryId,
        assessmentId,
        commentForCandidate: assessmentResult.commentForCandidate?.fallbackComment,
        commentForOrganization: assessmentResult.commentForOrganization?.fallbackComment,
        commentByAutoJury,
      })
      .returning('*');

    await knexConn('certification-courses-last-assessment-results')
      .insert({ certificationCourseId, lastAssessmentResultId: savedAssessmentResultData.id })
      .onConflict('certificationCourseId')
      .merge(['lastAssessmentResultId']);

    return _toDomain({ assessmentResultDTO: savedAssessmentResultData, competencesMarksDTO: [] });
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

const _getCommentByAutoJury = (assessmentResult) => {
  if (
    assessmentResult.commentForCandidate?.commentByAutoJury !==
    assessmentResult.commentForOrganization?.commentByAutoJury
  ) {
    throw new Error('Incoherent commentByAutoJury between commentForCandidate and commentForOrganization');
  }

  return assessmentResult.commentForCandidate?.commentByAutoJury;
};
