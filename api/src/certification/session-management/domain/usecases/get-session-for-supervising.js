/**
 * @typedef {import('./index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 */

/**
 * @param {Object} params
 * @param {SessionForSupervisingRepository} params.sessionForSupervisingRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 */
const getSessionForSupervising = async function ({ sessionId, sessionForSupervisingRepository }) {
  return sessionForSupervisingRepository.get({ id: sessionId });
};

export { getSessionForSupervising };
