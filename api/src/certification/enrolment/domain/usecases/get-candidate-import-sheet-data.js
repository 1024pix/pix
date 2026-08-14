/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Candidate } from '../models/Candidate.js';
/**
 * @param {object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {CenterRepository} params.centerRepository
 */
export async function getCandidateImportSheetData({ sessionId, sessionRepository, centerRepository }) {
  const session = await sessionRepository.get({ id: sessionId });

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  const enrolledCandidates = session.certificationCandidates.sort(Candidate.sortByLastNameAndFirstName);
  const center = await centerRepository.getById({ id: session.certificationCenterId });
  return {
    session,
    enrolledCandidates,
    certificationCenterHabilitations: center.habilitations,
    isScoCertificationCenter: center.isSco,
  };
}
