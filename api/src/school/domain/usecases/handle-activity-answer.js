import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedActivityAnswerRepository from '../../infrastructure/repositories/activity-answer-repository.js';
import * as injectedActivityRepository from '../../infrastructure/repositories/activity-repository.js';
import * as injectedMissionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import * as injectedMissionRepository from '../../infrastructure/repositories/mission-repository.js';
import { correctAnswer } from '../services/correct-answer.js';
import { initMissionActivity } from '../services/init-mission-activity.js';
import { updateAssessment } from '../services/update-assessment.js';
import { updateCurrentActivity } from '../services/update-current-activity.js';

const handleActivityAnswer = async function ({
  activityAnswer,
  assessmentId,
  examiner,
  challengeRepository = injectedChallengeRepository,
  assessmentRepository = injectedAssessmentRepository,
  activityAnswerRepository = injectedActivityAnswerRepository,
  activityRepository = injectedActivityRepository,
  missionAssessmentRepository = injectedMissionAssessmentRepository,
  missionRepository = injectedMissionRepository,
} = {}) {
  return DomainTransaction.execute(async () => {
    const correctedAnswer = await correctAnswer({
      activityAnswer,
      assessmentId,
      challengeRepository,
      assessmentRepository,
      activityAnswerRepository,
      activityRepository,
      examiner,
    });

    let lastActivity = await updateCurrentActivity({
      assessmentId,
      activityAnswerRepository,
      activityRepository,
      missionAssessmentRepository,
      missionRepository,
    });

    lastActivity = await initMissionActivity({
      lastActivity,
      assessmentId,
      activityRepository,
      missionAssessmentRepository,
      missionRepository,
    });

    await updateAssessment({
      lastActivity,
      assessmentId,
      assessmentRepository,
      activityRepository,
      missionAssessmentRepository,
    });

    return correctedAnswer;
  });
};

export { handleActivityAnswer };
