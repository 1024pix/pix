module.exports = async function endAssessmentBySupervisor({ assessmentId, assessmentRepository }) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    return;
  }

  await assessmentRepository.endBySupervisorByAssessmentId(assessmentId);
};
