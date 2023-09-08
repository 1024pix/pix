import { AreaForAdmin } from '../models/index.js';

const getFrameworkAreas = async function ({
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

  return areasWithCompetences.map(
    (areaWithCompetences) =>
      new AreaForAdmin({
        id: areaWithCompetences.id,
        frameworkId: areaWithCompetences.frameworkId,
        title: areaWithCompetences.title,
        code: areaWithCompetences.code,
        color: areaWithCompetences.color,
        allCompetences: areaWithCompetences.competences,
        allThematics: thematics,
        allTubes: tubes,
      }),
  );
};

export { getFrameworkAreas };
