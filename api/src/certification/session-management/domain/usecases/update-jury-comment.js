/**
 * @typedef {import ('./index.js').CourseAssessmentResultRepository} CourseAssessmentResultRepository
 * @typedef {import ('./index.js').SharedCompetenceMarkRepository} SharedCompetenceMarkRepository
 * @typedef {import ('./index.js').AssessmentResultRepository} AssessmentResultRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.assessmentResultCommentByJury
 * @param {number} params.juryId
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CourseAssessmentResultRepository} params.courseAssessmentResultRepository
 * @param {SharedCompetenceMarkRepository} params.sharedCompetenceMarkRepository
 */
export async function updateJuryComment({
  certificationCourseId,
  assessmentResultCommentByJury,
  juryId,
  courseAssessmentResultRepository,
  assessmentResultRepository,
  sharedCompetenceMarkRepository,
}) {
  await DomainTransaction.execute(async () => {
    const latestAssessmentResult = await courseAssessmentResultRepository.getLatestAssessmentResult({
      certificationCourseId,
    });
    if (!latestAssessmentResult) {
      throw new NotFoundError('No assessment result found');
    }

    const updatedAssessmentResult = latestAssessmentResult.clone();
    updatedAssessmentResult.commentByJury = assessmentResultCommentByJury;
    updatedAssessmentResult.juryId = juryId;

    const { id: assessmentResultId } = await assessmentResultRepository.save({
      certificationCourseId,
      assessmentResult: updatedAssessmentResult,
    });

    for (const competenceMark of latestAssessmentResult.competenceMarks) {
      await sharedCompetenceMarkRepository.save(new CompetenceMark({ ...competenceMark, assessmentResultId }));
    }
  });
}
