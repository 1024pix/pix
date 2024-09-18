import { Activity } from '../models/Activity.js';
import { Assessment } from '../models/Assessment.js';
import { computeGlobalResult } from './compute-global-result.js';
import { computeStepResult } from './compute-step-result.js';

const { REACHED, NOT_REACHED } = Assessment.results;

export async function updateAssessment({
  assessmentId,
  lastActivity,
  assessmentRepository,
  activityRepository,
  missionAssessmentRepository,
}) {
  await completeAssessment(assessmentId, lastActivity, assessmentRepository);
  await updateResult(assessmentId, lastActivity, missionAssessmentRepository, activityRepository);
}

async function completeAssessment(assessmentId, lastActivity, assessmentRepository) {
  if (lastActivity.status !== Activity.status.STARTED) {
    await assessmentRepository.completeByAssessmentId(assessmentId);
  }
}

async function updateResult(assessmentId, lastActivity, missionAssessmentRepository, activityRepository) {
  const missionAssessment = await missionAssessmentRepository.getByAssessmentId(assessmentId);
  const missionAssessmentStepResults = missionAssessment.result.steps || [];
  if (lastActivity.status === Activity.status.STARTED) {
    if (await shouldUpdateLastStepResult(assessmentId, activityRepository, missionAssessmentStepResults)) {
      await missionAssessmentRepository.updateResult(assessmentId, {
        steps: [...missionAssessmentStepResults, Assessment.results.REACHED],
      });
    }
  } else {
    const stepResults = getMissionAssessmentStepResult(missionAssessmentStepResults, lastActivity);
    const dareResult = getMissionAssessmentDareResult(lastActivity);

    await missionAssessmentRepository.updateResult(assessmentId, {
      global: computeGlobalResult(stepResults, dareResult),
      steps: stepResults,
      dare: dareResult,
    });
  }
}

async function shouldUpdateLastStepResult(assessmentId, activityRepository, missionAssessmentStepResults) {
  const activities = await activityRepository.getAllByAssessmentId(assessmentId);
  return stepIndexHasChanged(activities) && previousActivityIndex(activities) >= missionAssessmentStepResults.length;
}

function previousActivityIndex(activities) {
  return activities[1]?.stepIndex || 0;
}

function stepIndexHasChanged(activities) {
  return activities.length !== 1 && activities[0]?.stepIndex !== activities[1]?.stepIndex;
}

function getMissionAssessmentStepResult(missionAssessmentStepResults, lastActivity) {
  return [...missionAssessmentStepResults, computeStepResult(lastActivity)].filter((result) => !!result);
}

function getMissionAssessmentDareResult(lastActivity) {
  if (lastActivity.isDare) {
    return lastActivity.status === Activity.status.SUCCEEDED ? REACHED : NOT_REACHED;
  }
}
