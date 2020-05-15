const { ObjectValidationError } = require('../errors');

module.exports = async function assignCertificationOfficerToSession({
  sessionId,
  certificationOfficerId,
  jurySessionRepository,
} = {}) {
  const integerSessionId = parseInt(sessionId);
  if (!Number.isFinite(integerSessionId)) {
    throw new ObjectValidationError(`L'id ${sessionId} n'est pas un id de session valide.`);
  }
  const integerCertificationOfficerId = parseInt(certificationOfficerId);
  if (!Number.isFinite(integerCertificationOfficerId)) {
    throw new ObjectValidationError(`L'id ${certificationOfficerId} n'est pas un id de chargé de certification valide.`);
  }

  return jurySessionRepository.assignCertificationOfficer({ id: integerSessionId, assignedCertificationOfficerId: integerCertificationOfficerId });
};
