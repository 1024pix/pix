import {
  AssessmentSheet,
  STATES,
  STATES_OF_LAST_QUESTION,
} from '../../../../../../src/certification/evaluation/domain/models/AssessmentSheet.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

export const buildAssessmentSheet = function ({
  certificationCourseId = 1,
  assessmentId = 2,
  userId = 3,
  startedAt = new Date(),
  lastChallengeId = null,
  abortReason = null,
  isRejectedForFraud = false,
  state = STATES.COMPLETED,
  lastQuestionState = STATES_OF_LAST_QUESTION.ASKED,
  assessmentUpdatedAt = new Date(),
  certificationCourseUpdatedAt = new Date(),
  lastAnswerAt = new Date(),
  lastQuestionDate = new Date(),
  versionId = 4,
  certificationFramework = Frameworks.CORE,
  answers = [],
  lang,
  accessibilityAdjustmentNeeded,
} = {}) {
  return new AssessmentSheet({
    certificationCourseId,
    assessmentId,
    userId,
    startedAt,
    lastChallengeId,
    abortReason,
    isRejectedForFraud,
    state,
    lastQuestionState,
    assessmentUpdatedAt,
    certificationCourseUpdatedAt,
    lastAnswerAt,
    lastQuestionDate,
    versionId,
    certificationFramework,
    answers,
    lang,
    accessibilityAdjustmentNeeded,
  });
};

buildAssessmentSheet.STATES = STATES;
buildAssessmentSheet.STATES_OF_LAST_QUESTION = STATES_OF_LAST_QUESTION;
