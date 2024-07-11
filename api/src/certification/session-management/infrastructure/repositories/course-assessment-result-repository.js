import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';

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
    commentByJury: assessmentResultDTO.commentByJury,
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    createdAt: assessmentResultDTO.createdAt,
    emitter: assessmentResultDTO.emitter,
    juryId: assessmentResultDTO.juryId,
    pixScore: assessmentResultDTO.pixScore,
    commentForCandidate,
    commentForOrganization,
    reproducibilityRate: reproducibilityRateAsNumber,
    competenceMarks: competenceMarks,
  });
}

const getLatestAssessmentResult = async function ({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();

  const latestAssessmentResult = await knexConn('certification-courses-last-assessment-results')
    .select('assessment-results.*')
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .where({ certificationCourseId })
    .first();

  if (!latestAssessmentResult) {
    throw new NotFoundError('No assessment result found');
  }
  const competencesMarksDTO = await knexConn('competence-marks').where({
    assessmentResultId: latestAssessmentResult.id,
  });

  return _toDomain({
    assessmentResultDTO: latestAssessmentResult,
    competencesMarksDTO,
  });
};

export { getLatestAssessmentResult };
