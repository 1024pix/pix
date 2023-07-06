import { Activity } from '../../../../lib/domain/models/Activity.js';

function buildActivity({
  id = 123,
  assessmentId = 456,
  level = Activity.levels.TUTORIAL,
  createdAt = new Date(),
  status = Activity.status.STARTED,
} = {}) {
  return new Activity({
    id,
    assessmentId,
    level,
    createdAt,
    status,
  });
}

export { buildActivity };
