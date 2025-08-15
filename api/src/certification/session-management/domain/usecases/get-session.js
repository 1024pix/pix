import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';

const getSession = async function ({ sessionId, sessionRepository = injectedSessionRepository } = {}) {
  const session = await sessionRepository.get({ id: sessionId });
  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });
  return {
    session,
    hasSomeCleaAcquired,
  };
};

export { getSession };
