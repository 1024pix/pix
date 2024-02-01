const findAllMissions = async function ({ missionRepository }) {
  return await missionRepository.findAllMissions();
};

export { findAllMissions };
