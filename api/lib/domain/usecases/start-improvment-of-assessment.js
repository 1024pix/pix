module.exports = async function startImprovmentOfAssessment({ assessmentId, assessmentRepository }) {
  const assessmentUpdated = await assessmentRepository.startImprovingAssessment({ id: assessmentId });
  return assessmentUpdated;
};
