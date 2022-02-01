module.exports = function getJurySession({ sessionId, jurySessionRepository }) {
  return jurySessionRepository.get(sessionId);
};
