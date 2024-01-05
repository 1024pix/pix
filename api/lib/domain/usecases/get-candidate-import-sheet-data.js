const getCandidateImportSheetData = async function ({ sessionId, sessionRepository, certificationCenterRepository }) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);
  const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);

  return {
    session,
    certificationCenterHabilitations: certificationCenter.habilitations,
    isScoCertificationCenter: certificationCenter.isSco,
  };
};

export { getCandidateImportSheetData };
