module.exports = async function getFrameworkAreas({
  frameworkId,
  challengeRepository,
  tubeRepository,
  thematicRepository,
  areaRepository,
}) {
  const areasWithCompetences = await areaRepository.findByFrameworkIdWithCompetences(frameworkId);

  const competences = areasWithCompetences.flatMap((area) => area.competences);

  const competenceIds = competences.map(({ id: competenceId }) => competenceId);
  const thematics = await thematicRepository.findByCompetenceIds(competenceIds);

  const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds);
  const tubes = await tubeRepository.findActiveByRecordIds(tubeIds);

  const validatedChallenges = await challengeRepository.findValidatedPrototype();

  const tubesWithResponsiveStatus = tubes.map((tube) => {
    const tubeChallenges = validatedChallenges.filter((challenge) => {
      return challenge.skill.tubeId === tube.id;
    });
    tube.mobile = _areChallengesMobileResponsive(tubeChallenges);
    tube.tablet = _areChallengesTabletResponsive(tubeChallenges);
    return tube;
  });

  return { areas: areasWithCompetences, thematics, tubes: tubesWithResponsiveStatus };
};

function _areChallengesMobileResponsive(challenges) {
  return _areChallengesResponsive(challenges, 'Smartphone');
}

function _areChallengesTabletResponsive(challenges) {
  return _areChallengesResponsive(challenges, 'Tablet');
}

function _areChallengesResponsive(challenges, type) {
  return (
    challenges.length > 0 &&
    challenges.every((challenge) => {
      return challenge.responsive?.includes(type);
    })
  );
}
