import { InvalidSessionSupervisingLoginError, SessionNotAccessible } from '../../../../../lib/domain/errors.js';

const superviseSession = async function ({
  sessionId,
  supervisorPassword,
  userId,
  sessionRepository,
  supervisorAccessRepository,
}) {
  // should use a specific get from sessionRepository instead
  const session = await sessionRepository.get({ id: sessionId });
  if (!session.isSupervisable(supervisorPassword)) {
    throw new InvalidSessionSupervisingLoginError();
  }
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }
  await supervisorAccessRepository.create({ sessionId, userId });
};

export { superviseSession };
