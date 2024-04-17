async function injectComplementDataTo({
  mission,
  organizationId,
  areaRepository,
  competenceRepository,
  organizationLearnerRepository,
}) {
  const areaCode = await areaRepository.getAreaCodeByCompetenceId(mission.competenceId);
  const { name, index } = await competenceRepository.get({ id: mission.competenceId });

  let divisions = null;
  if (organizationId) {
    divisions = await organizationLearnerRepository.getDivisionsWhichStartedMission({
      missionId: mission.id,
      organizationId,
    });
  }

  return { ...mission, areaCode, competenceName: `${index} ${name}`, startedBy: divisions };
}

export { injectComplementDataTo };
