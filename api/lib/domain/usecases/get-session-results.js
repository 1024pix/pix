const getSessionResults = async function ({ sessionId, sessionRepository, certificationResultRepository }) {
  const session = await sessionRepository.get({ id: sessionId });
  const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

  return { session, certificationResults };
};

export { getSessionResults };
