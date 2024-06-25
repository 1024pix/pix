/**
 * @typedef {import ('./index.js').AssessmentResultJuryCommentRepository} AssessmentResultJuryCommentRepository
 */

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.assessmentResultCommentByJury
 * @param {number} params.juryId
 * @param {AssessmentResultJuryCommentRepository} params.assessmentResultJuryCommentRepository
 */
const updateJuryComment = async function ({
  certificationCourseId,
  assessmentResultCommentByJury,
  juryId,
  assessmentResultJuryCommentRepository,
}) {
  const assessmentResultJuryComment = await assessmentResultJuryCommentRepository.getLatestAssessmentResultJuryComment({
    certificationCourseId,
  });

  await assessmentResultJuryCommentRepository.update({
    ...assessmentResultJuryComment,
    commentByJury: assessmentResultCommentByJury,
    juryId: juryId,
  });
};

export { updateJuryComment };
