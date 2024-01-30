/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import ('../../../shared/domain/usecases/index.js').CompetenceMarkRepository} CompetenceMarkRepository
 */

import { CompetenceMark, AssessmentResult } from '../../../../../lib/domain/models/index.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {Object} params.assessmentResultComments
 * @param {number} params.assessmentResultComments.assessmentId
 * @param {string} params.assessmentResultComments.commentByJury
 * @param {string} params.assessmentResultComments.commentForCandidate
 * @param {string} params.assessmentResultComments.commentForOrganization
 * @param {number} params.juryId
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 */
const updateJuryComments = async function ({
  certificationCourseId,
  assessmentResultComments,
  juryId,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  await DomainTransaction.execute(async (domainTransaction) => {
    const latestAssessmentResult = await assessmentResultRepository.getLatestByAssessmentId({
      assessmentId: assessmentResultComments.assessmentId,
      domainTransaction,
    });

    const updatedAssessmentResult = latestAssessmentResult.clone();
    updatedAssessmentResult.commentByJury = assessmentResultComments.commentByJury;
    updatedAssessmentResult.commentForCandidate = assessmentResultComments.commentForCandidate;
    updatedAssessmentResult.commentForOrganization = assessmentResultComments.commentForOrganization;
    updatedAssessmentResult.juryId = juryId;
    updatedAssessmentResult.emitter = AssessmentResult.emitters.PIX_JURY;

    const { id: assessmentResultId } = await assessmentResultRepository.save({
      certificationCourseId,
      assessmentResult: updatedAssessmentResult,
      domainTransaction,
    });

    for (const competenceMark of latestAssessmentResult.competenceMarks) {
      await competenceMarkRepository.save(
        new CompetenceMark({ ...competenceMark, assessmentResultId }),
        domainTransaction,
      );
    }
  });
};

export { updateJuryComments };
