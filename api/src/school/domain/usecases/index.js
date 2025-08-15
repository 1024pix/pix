import { activateSchoolSession } from './activate-school-session.js';
import { correctPreviewAnswer } from './correct-preview-answer.js';
import { createPreviewAssessment } from './create-preview-assessment.js';
import { findAllActiveMissions } from './find-all-active-missions.js';
import {
  filterByGlobalResult,
  filterByStatuses,
  findPaginatedMissionLearners,
} from './find-paginated-mission-learners.js';
import { getAssessmentById } from './get-assessment-by-id.js';
import { getChallenge } from './get-challenge.js';
import { getCurrentActivity } from './get-current-activity.js';
import { getDivisions } from './get-divisions.js';
import { getMission } from './get-mission.js';
import { getNextChallenge } from './get-next-challenge.js';
import { getOrganizationLearnerWithMissionIdsByState } from './get-organization-learner-with-completed-mission-ids.js';
import { getSchoolByCode } from './get-school-by-code.js';
import { handleActivityAnswer } from './handle-activity-answer.js';
import { playMission } from './play-mission.js';

const usecases = {
  activateSchoolSession,
  correctPreviewAnswer,
  createPreviewAssessment,
  findAllActiveMissions,
  filterByGlobalResult,
  filterByStatuses,
  findPaginatedMissionLearners,
  getAssessmentById,
  getChallenge,
  getCurrentActivity,
  getDivisions,
  getMission,
  getNextChallenge,
  getOrganizationLearnerWithMissionIdsByState,
  getSchoolByCode,
  handleActivityAnswer,
  playMission,
};

export { usecases };
