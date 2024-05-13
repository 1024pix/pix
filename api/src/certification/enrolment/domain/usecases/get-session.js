const getSession = async function ({ sessionId, sessionRepository }) {
  return sessionRepository.get({ id: sessionId });
};

export { getSession };
