module.exports = async function getSessionForSupervising({ sessionId, sessionForSupervisingRepository }) {
  return await sessionForSupervisingRepository.get(sessionId);
};
