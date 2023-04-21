module.exports = async function completeAssessmentForPix1d({ assessmentId, assessmentRepository }) {
  return await assessmentRepository.completeByAssessmentId(assessmentId);
};
