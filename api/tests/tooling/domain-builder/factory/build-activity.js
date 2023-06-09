import { Activity } from '../../../../lib/domain/models/Activity.js';

function buildActivity({
  id = 123,
  assessmentId = 456,
  level = Activity.levels.TUTORIAL,
  createdAt = new Date(),
} = {}) {
  return new Activity({
    id,
    assessmentId,
    level,
    createdAt,
  });
}

export { buildActivity };
