import { Activity } from '../models/Activity.js';
import { ActivityInfo } from '../models/ActivityInfo.js';

export async function updateCurrentActivity({
  assessmentId,
  activityRepository,
  activityAnswerRepository,
  missionAssessmentRepository,
  missionRepository,
  domainTransaction,
}) {
  const lastActivity = await activityRepository.getLastActivity(assessmentId, domainTransaction);
  const answers = await activityAnswerRepository.findByActivity(lastActivity.id, domainTransaction);
  const lastAnswer = answers.at(-1);

  if (lastAnswer.result.isOK() || lastActivity.isTutorial) {
    const { missionId } = await missionAssessmentRepository.getByAssessmentId(assessmentId, domainTransaction);
    const mission = await missionRepository.get(missionId);
    if (_isActivityFinished(mission, lastActivity, answers)) {
      return activityRepository.updateStatus(
        { activityId: lastActivity.id, status: Activity.status.SUCCEEDED },
        domainTransaction,
      );
    }
    return lastActivity;
  }
  if (lastAnswer.result.isKO()) {
    return activityRepository.updateStatus(
      { activityId: lastActivity.id, status: Activity.status.FAILED },
      domainTransaction,
    );
  }
  return activityRepository.updateStatus(
    { activityId: lastActivity.id, status: Activity.status.SKIPPED },
    domainTransaction,
  );
}

function _isActivityFinished(mission, lastActivity, answers) {
  return mission.getChallengeIds(new ActivityInfo(lastActivity)).length === answers.length;
}
