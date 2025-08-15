import * as injectedCertificationOfficerRepository from '../../infrastructure/repositories/certification-officer-repository.js';
import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';
import * as injectedJurySessionRepository from '../../infrastructure/repositories/jury-session-repository.js'; /**
 * @typedef {import('../../domain/usecases/index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../domain/usecases/index.js').CertificationOfficerRepository} CertificationOfficerRepository
 */

/**
 * @param {Object} params
 * @param {JurySessionRepository} params.jurySessionRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {CertificationOfficerRepository} params.certificationOfficerRepository
 */
const assignCertificationOfficerToJurySession = async function ({
  sessionId,
  certificationOfficerId,
  jurySessionRepository = injectedJurySessionRepository,
  finalizedSessionRepository = injectedFinalizedSessionRepository,
  certificationOfficerRepository = injectedCertificationOfficerRepository,
} = {}) {
  const certificationOfficer = await certificationOfficerRepository.get({ userId: certificationOfficerId });
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });

  finalizedSession.assignCertificationOfficer({ certificationOfficerName: certificationOfficer.getFullName() });

  await finalizedSessionRepository.save({ finalizedSession });

  await jurySessionRepository.assignCertificationOfficer({
    id: finalizedSession.sessionId,
    assignedCertificationOfficerId: certificationOfficer.id,
  });

  return jurySessionRepository.get({ id: finalizedSession.sessionId });
};

export { assignCertificationOfficerToJurySession };
