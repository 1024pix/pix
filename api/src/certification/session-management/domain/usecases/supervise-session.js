import { InvalidSessionSupervisingLoginError, SessionNotAccessible } from '../../domain/errors.js';

const superviseSession = async function ({
  sessionId,
  invigilatorPassword,
  userId,
  sessionRepository,
  supervisorAccessRepository,
}) {
  // should use a specific get from sessionRepository instead
  const session = await sessionRepository.get({ id: sessionId });
  if (!session.isSupervisable(invigilatorPassword)) {
    throw new InvalidSessionSupervisingLoginError();
  }
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }
  await supervisorAccessRepository.create({ sessionId, userId });
};

export { superviseSession };
