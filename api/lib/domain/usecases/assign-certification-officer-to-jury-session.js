const { ObjectValidationError } = require('../errors');

module.exports = async function assignCertificationOfficerToJurySession({
  sessionId,
  certificationOfficerId,
  jurySessionRepository,
  finalizedSessionRepository,
  userRepository,
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

  const certificationOfficer = await userRepository.get(certificationOfficerId);
  const { firstName, lastName } = certificationOfficer;
  const certificationOfficerName = `${firstName} ${lastName}`;

  await finalizedSessionRepository.assignCertificationOfficer({
    sessionId: integerSessionId,
    assignedCertificationOfficerName: certificationOfficerName,
  });
  return jurySessionRepository.assignCertificationOfficer({
    id: integerSessionId,
    assignedCertificationOfficerId: integerCertificationOfficerId,
  });
};
