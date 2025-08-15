/**
 * @typedef {import ('./index.js').CourseAssessmentResultRepository} CourseAssessmentResultRepository
 * @typedef {import ('./index.js').SharedCompetenceMarkRepository} SharedCompetenceMarkRepository
 * @typedef {import ('./index.js').AssessmentResultRepository} AssessmentResultRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import * as injectedCourseAssessmentResultRepository from '../../infrastructure/repositories/course-assessment-result-repository.js';
import { assessmentResultRepository as injectedAssessmentResultRepository } from '../../infrastructure/repositories/index.js';
import { sharedCompetenceMarkRepository as injectedSharedCompetenceMarkRepository } from '../../infrastructure/repositories/index.js';
/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.assessmentResultCommentByJury
 * @param {number} params.juryId
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CourseAssessmentResultRepository} params.courseAssessmentResultRepository
 * @param {SharedCompetenceMarkRepository} params.sharedCompetenceMarkRepository
 */
const updateJuryComment = async function ({
  certificationCourseId,
  assessmentResultCommentByJury,
  juryId,
  courseAssessmentResultRepository = injectedCourseAssessmentResultRepository,
  assessmentResultRepository = injectedAssessmentResultRepository,
  sharedCompetenceMarkRepository = injectedSharedCompetenceMarkRepository,
} = {}) {
  await DomainTransaction.execute(async () => {
    const latestAssessmentResult = await courseAssessmentResultRepository.getLatestAssessmentResult({
      certificationCourseId,
    });

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
};

export { updateJuryComment };
