module.exports = async function getSession(
  {
    userId,
    sessionId,
    sessionRepository,
    userRepository,
  } = {}) {
  const isPixMaster = await userRepository.hasRolePixMaster(userId);
  if (!isPixMaster) {
    await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
  }

  return sessionRepository.get(sessionId);
};
