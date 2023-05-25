import { Assessment } from '../models/Assessment.js';

const createMissionAssessment = async function ({ missionId, assessmentRepository }) {
  const assessment = Assessment.createForPix1dMission({ missionId });
  return assessmentRepository.save({ assessment });
};

export { createMissionAssessment };
