async function injectComplementDataTo(mission, areaRepository, competenceRepository) {
  const areaCode = await areaRepository.getAreaCodeByCompetenceId(mission.competenceId);
  const { name, index } = await competenceRepository.get({ id: mission.competenceId });

  return { ...mission, areaCode, competenceName: `${index} ${name}` };
}

export { injectComplementDataTo };
