/**
 * @typedef {import('./index.js').AssessmentResultRepository} AssessmentResultRepository
 */

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {number} params.juryId
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 */
export const uncancel = async function ({ certificationCourseId, juryId, assessmentResultRepository }) {
  const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  const newAssessmentResult = assessmentResult.clone();
  newAssessmentResult.uncancel({ juryId });

  await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult: newAssessmentResult,
  });
};
