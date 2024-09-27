import { Activity } from '../models/Activity.js';
import { Assessment } from '../models/Assessment.js';

const { REACHED, NOT_REACHED, PARTIALLY_REACHED } = Assessment.results;

export function computeStepResult(lastActivity) {
  if (!lastActivity.isInStep) {
    return undefined;
  }

  if (lastActivity.level === Activity.levels.VALIDATION && lastActivity.status === Activity.status.SUCCEEDED) {
    return REACHED;
  }

  if (lastActivity.level === Activity.levels.VALIDATION && lastActivity.status === Activity.status.FAILED) {
    return PARTIALLY_REACHED;
  }

  return NOT_REACHED;
}
