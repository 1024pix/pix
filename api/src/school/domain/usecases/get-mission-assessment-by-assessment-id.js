const getMissionAssessmentByAssessmentId = async function ({ assessmentId, missionAssessmentRepository }) {
  return await missionAssessmentRepository.getByAssessmentId(assessmentId);
};

export { getMissionAssessmentByAssessmentId };
