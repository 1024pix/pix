import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionAlreadyPublishedError } from '../errors.js';
import { PublishSessionJob } from '../models/PublishSessionJob.js';

export async function requestMultipleSessionPublication({
  sessionIds,
  sessionManagementRepository,
  publishSessionJobRepository,
}) {
  const errors = {};
  const foundedSessionIdWithPublishedAt = await sessionManagementRepository.getSessionIdAndPublishedAt(sessionIds);

  const foundedSessionIdOnly = foundedSessionIdWithPublishedAt.map((f) => f.id);
  const notFoundSessionIds = sessionIds.filter((sessionId) => !foundedSessionIdOnly.includes(sessionId));
  for (const notFoundSessionId of notFoundSessionIds) {
    errors[notFoundSessionId] = new NotFoundError(`Session id ${notFoundSessionId} not found`);
  }

  const jobs = [];
  for (const { id, publishedAt } of foundedSessionIdWithPublishedAt) {
    if (publishedAt) {
      errors[id] = new SessionAlreadyPublishedError(`Session id ${id} is already published`);
      continue;
    }
    jobs.push(new PublishSessionJob({ sessionId: id }));
  }
  await publishSessionJobRepository.performManyAsync(jobs);
  return errors;
}
