const cacheArea = {};

async function _injectColorFromAreaTo(mission, areaRepository) {
  let areaCode = cacheArea[mission.competenceId];

  if (!areaCode) {
    areaCode = await areaRepository.getAreaCodeByCompetenceId(mission.competenceId);
    cacheArea[mission.competenceId] = areaCode;
  }

  return { ...mission, areaCode };
}

async function findAllMissions({ missionRepository, areaRepository }) {
  const missions = await missionRepository.findAllMissions();
  return Promise.all(missions.map(async (mission) => await _injectColorFromAreaTo(mission, areaRepository)));
}

export { findAllMissions };
