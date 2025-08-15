import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';

const getSession = async function ({ sessionId, sessionRepository = injectedSessionRepository } = {}) {
  return sessionRepository.get({ id: sessionId });
};

export { getSession };
