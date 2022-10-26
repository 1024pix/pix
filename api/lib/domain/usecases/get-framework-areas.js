module.exports = async function getFrameworkAreas({
  frameworkId,
  frameworkName,
  locale,
  tubeRepository,
  thematicRepository,
  areaRepository,
  frameworkRepository,
}) {
  if (!frameworkId) {
    const framework = await frameworkRepository.getByName(frameworkName);
    frameworkId = framework.id;
  }

  const areasWithCompetences = await areaRepository.findByFrameworkIdWithCompetences({ frameworkId, locale });

  const competences = areasWithCompetences.flatMap((area) => area.competences);

  const competenceIds = competences.map(({ id: competenceId }) => competenceId);
  const thematics = await thematicRepository.findByCompetenceIds(competenceIds, locale);

  const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds);
  const tubes = await tubeRepository.findActiveByRecordIds(tubeIds, locale);
  for (const tube of tubes) {
    tube.mobile = tube.isMobileCompliant;
    tube.tablet = tube.isTabletCompliant;
    delete tube.isMobileCompliant;
    delete tube.isTabletCompliant;
  }

  return { areas: areasWithCompetences, thematics, tubes };
};
