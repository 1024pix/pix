const cacheArea = {};
async function injectCodeFromAreaTo(mission, areaRepository) {
  let areaCode = cacheArea[mission.competenceId];
  if (!areaCode) {
    areaCode = await areaRepository.getAreaCodeByCompetenceId(mission.competenceId);
    cacheArea[mission.competenceId] = areaCode;
  }

  return { ...mission, areaCode };
}

export { injectCodeFromAreaTo };
