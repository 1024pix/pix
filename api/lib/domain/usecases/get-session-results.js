const getSessionResults = async function ({ sessionId, sessionEnrolmentRepository, certificationResultRepository }) {
  const session = await sessionEnrolmentRepository.get({ id: sessionId });
  const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

  return { session, certificationResults };
};

export { getSessionResults };
