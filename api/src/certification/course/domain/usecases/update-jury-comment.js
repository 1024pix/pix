/**
 * @typedef {import ('../../domain/usecases/index.js').CourseAssessmentResultRepository} CourseAssessmentResultRepository
 * @typedef {import ('../../domain/usecases/index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import ('../../domain/usecases/index.js').AssessmentResultRepository} AssessmentResultRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AssessmentResult, CompetenceMark } from '../../../../shared/domain/models/index.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.assessmentResultCommentByJury
 * @param {number} params.juryId
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CourseAssessmentResultRepository} params.courseAssessmentResultRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 */
const updateJuryComment = async function ({
  certificationCourseId,
  assessmentResultCommentByJury,
  juryId,
  courseAssessmentResultRepository,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  await DomainTransaction.execute(async (domainTransaction) => {
    const latestAssessmentResult = await courseAssessmentResultRepository.getLatestAssessmentResult({
      certificationCourseId,
      domainTransaction,
    });

    const updatedAssessmentResult = latestAssessmentResult.clone();
    updatedAssessmentResult.commentByJury = assessmentResultCommentByJury;
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

export { updateJuryComment };
