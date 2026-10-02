import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionAlreadyPublishedError } from '../errors.js';

export async function sessionPublicationRequest({
  sessionId,
  publishSessionJobRepository,
  sessionManagementRepository,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });
  if (!session) {
    throw new NotFoundError('Session not found');
  }

  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }

  await publishSessionJobRepository.performAsync({ sessionId });
}
