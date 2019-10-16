module.exports = function getSession(
  {
    sessionId,
    sessionRepository,
  } = {}) {
  return sessionRepository.get(sessionId);
};
