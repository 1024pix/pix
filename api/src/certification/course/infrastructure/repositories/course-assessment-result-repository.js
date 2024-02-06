import _ from 'lodash';
import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../../../lib/domain/models/CompetenceMark.js';

function _toDomain({ assessmentResultDTO, competencesMarksDTO }) {
  const competenceMarks = competencesMarksDTO.map((competenceMark) => new CompetenceMark(competenceMark));

  const reproducibilityRateAsNumber = _.toNumber(assessmentResultDTO.reproducibilityRate) ?? null;
  return new AssessmentResult({
    id: assessmentResultDTO.id,
    assessmentId: assessmentResultDTO.assessmentId,
    status: assessmentResultDTO.status,
    commentForCandidate: assessmentResultDTO.commentForCandidate,
    commentForOrganization: assessmentResultDTO.commentForOrganization,
    commentByJury: assessmentResultDTO.commentByJury,
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    createdAt: assessmentResultDTO.createdAt,
    emitter: assessmentResultDTO.emitter,
    juryId: assessmentResultDTO.juryId,
    pixScore: assessmentResultDTO.pixScore,
    reproducibilityRate: reproducibilityRateAsNumber,
    competenceMarks: competenceMarks,
  });
}

const getLatestAssessmentResult = async function ({
  certificationCourseId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;

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
