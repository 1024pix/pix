import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedMissionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import { Assessment } from '../models/Assessment.js';

const getAssessmentById = async function ({
  assessmentId,
  missionAssessmentRepository = injectedMissionAssessmentRepository,
  assessmentRepository = injectedAssessmentRepository,
} = {}) {
  const rawAssessment = await assessmentRepository.get(assessmentId);
  const rawMissionAssessment = await missionAssessmentRepository.getByAssessmentId(assessmentId);
  return new Assessment({ ...rawAssessment, ...rawMissionAssessment });
};

export { getAssessmentById };
