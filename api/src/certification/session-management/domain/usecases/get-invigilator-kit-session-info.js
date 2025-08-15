import * as injectedSessionForInvigilatorKitRepository from '../../infrastructure/repositories/session-for-invigilator-kit-repository.js'; /**
 * @typedef {import('./index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 */

/**
 * @param {Object} params
 * @param {SessionForInvigilatorKitRepository} params.sessionForInvigilatorKitRepository
 */
const getInvigilatorKitSessionInfo = async function ({
  sessionId,
  sessionForInvigilatorKitRepository = injectedSessionForInvigilatorKitRepository,
} = {}) {
  return sessionForInvigilatorKitRepository.get({ id: sessionId });
};

export { getInvigilatorKitSessionInfo };
