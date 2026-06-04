import * as challengeToPlayApi from '../../../evaluation/application/api/challenge-to-play-api.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as activityAnswerRepository from '../../infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../infrastructure/repositories/activity-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as missionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../infrastructure/repositories/mission-repository.js';

const dependencies = {
  activityAnswerRepository,
  activityRepository,
  areaRepository,
  assessmentRepository,
  competenceRepository,
  missionAssessmentRepository,
  missionRepository,
  missionLearnerRepository: repositories.missionLearnerRepository,
  organizationLearnerRepository: repositories.organizationLearnerRepository,
  schoolRepository: repositories.schoolRepository,
  challengeRepository,
  challengeToPlayApi,
};

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
import { getCurrentActivity } from './get-current-activity.js';
import { getDivisions } from './get-divisions.js';
import { getMission } from './get-mission.js';
import { getNextChallenge } from './get-next-challenge.js';
import { getOrganizationLearnerWithMissionIdsByState } from './get-organization-learner-with-completed-mission-ids.js';
import { getSchoolByCode } from './get-school-by-code.js';
import { handleActivityAnswer } from './handle-activity-answer.js';
import { isSchoolSessionActive } from './is-school-session-active.js';
import { playMission } from './play-mission.js';

const usecasesWithoutInjectedDependencies = {
  activateSchoolSession,
  correctPreviewAnswer,
  createPreviewAssessment,
  findAllActiveMissions,
  filterByGlobalResult,
  filterByStatuses,
  findPaginatedMissionLearners,
  getAssessmentById,
  getCurrentActivity,
  getDivisions,
  getMission,
  getNextChallenge,
  getOrganizationLearnerWithMissionIdsByState,
  getSchoolByCode,
  handleActivityAnswer,
  isSchoolSessionActive,
  playMission,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
