export default async function getFrameworkAreas({
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

  return { areas: areasWithCompetences, thematics, tubes };
}
