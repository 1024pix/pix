const getSessionForSupervising = async function ({ sessionId, sessionForSupervisingRepository }) {
  return await sessionForSupervisingRepository.get(sessionId);
};

export { getSessionForSupervising };
