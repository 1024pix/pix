import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { correctAnswer } from '../services/correct-answer.js';
import { initMissionActivity } from '../services/init-mission-activity.js';
import { updateAssessment } from '../services/update-assessment.js';
import { updateCurrentActivity } from '../services/update-current-activity.js';

const handleActivityAnswer = async function ({
  activityAnswer,
  assessmentId,
  examiner,
  challengeRepository,
  assessmentRepository,
  activityAnswerRepository,
  activityRepository,
  missionAssessmentRepository,
  missionRepository,
}) {
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
    });

    return correctedAnswer;
  });
};

export { handleActivityAnswer };
