/**
 * @typedef {import('../../../shared/domain/usecases/index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../../shared/domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationOfficerRepository} CertificationOfficerRepository
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
  jurySessionRepository,
  finalizedSessionRepository,
  certificationOfficerRepository,
} = {}) {
  const certificationOfficer = await certificationOfficerRepository.get(certificationOfficerId);
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });

  finalizedSession.assignCertificationOfficer({ certificationOfficerName: certificationOfficer.getFullName() });

  await finalizedSessionRepository.save(finalizedSession);

  return jurySessionRepository.assignCertificationOfficer({
    id: finalizedSession.sessionId,
    assignedCertificationOfficerId: certificationOfficer.id,
  });
};

export { assignCertificationOfficerToJurySession };
