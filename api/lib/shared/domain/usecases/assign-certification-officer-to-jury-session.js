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
