import { Assessment as SchoolAssessment } from '../../../../src/school/domain/models/Assessment.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';

function buildSchoolAssessment({
  id,
  courseId = null,
  certificationCourseId = null,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  userId = null,
  title,
  type = Assessment.types.PIX1D_MISSION,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  liveAlerts,
  course,
  answers = [],
  campaignParticipationId = null,
  competenceId = null,
  lastQuestionDate = null,
  lastChallengeId = null,
  lastQuestionState = Assessment.statesOfLastQuestion.ASKED,
  method = Assessment.methods.PIX1D,
  campaignCode,
  missionId,
  organizationLearnerId,
} = {}) {
  return new SchoolAssessment({
    id,
    courseId,
    certificationCourseId,
    createdAt,
    updatedAt,
    userId,
    title,
    type,
    state,
    isImproving,
    liveAlerts,
    competenceId,
    lastQuestionDate,
    lastChallengeId,
    lastQuestionState,
    answers,
    course,
    campaignParticipationId,
    method,
    campaignCode,
    missionId,
    organizationLearnerId,
  });
}

export { buildSchoolAssessment };
