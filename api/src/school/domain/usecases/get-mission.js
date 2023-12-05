const getMission = async function ({ missionId, missionRepository }) {
  return await missionRepository.get(missionId);
};

export { getMission };
