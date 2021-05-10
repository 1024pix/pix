const { ObjectValidationError } = require('../errors');

module.exports = async function assignCertificationOfficerToJurySession({
  sessionId,
  certificationOfficerId,
  jurySessionRepository,
  finalizedSessionRepository,
  certificationOfficerRepository,
} = {}) {
  const integerSessionId = parseInt(sessionId);
  if (!Number.isFinite(integerSessionId)) {
    throw new ObjectValidationError(
      `L'id ${sessionId} n'est pas un id de session valide.`,
    );
  }
  const integerCertificationOfficerId = parseInt(certificationOfficerId);
  if (!Number.isFinite(integerCertificationOfficerId)) {
    throw new ObjectValidationError(
      `L'id ${certificationOfficerId} n'est pas un id de chargé de certification valide.`,
    );
  }

  const certificationOfficer = await certificationOfficerRepository.get(certificationOfficerId);
  const finalizedSession = await finalizedSessionRepository.get({ sessionId: integerSessionId });

  finalizedSession.assignCertificationOfficer({ certificationOfficerName: certificationOfficer.getFullName() });

  await finalizedSessionRepository.save(finalizedSession);

  return jurySessionRepository.assignCertificationOfficer({
    id: finalizedSession.sessionId,
    assignedCertificationOfficerId: certificationOfficer.id,
  });
};
