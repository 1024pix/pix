import { Activity } from '../../../../src/school/domain/models/Activity.js';

function buildActivity({
  id = 123,
  assessmentId = 456,
  level = Activity.levels.TUTORIAL,
  createdAt = new Date(),
  status = Activity.status.STARTED,
  stepIndex,
} = {}) {
  return new Activity({
    id,
    assessmentId,
    level,
    createdAt,
    status,
    stepIndex,
  });
}

export { buildActivity };
