import { Assessment } from '../models/Assessment.js';

const getAssessmentById = async function ({ assessmentId, missionAssessmentRepository, assessmentRepository }) {
  const rawAssessment = await assessmentRepository.get(assessmentId);
  const rawMissionAssessment = await missionAssessmentRepository.getByAssessmentId(assessmentId);
  return new Assessment({ ...rawAssessment, ...rawMissionAssessment });
};

export { getAssessmentById };
