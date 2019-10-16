module.exports = function findSessions(
  {
    sessionRepository,
  } = {}) {
  return sessionRepository.find();
};
