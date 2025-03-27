import { AreaForAdmin } from '../../../../shared/domain/models/index.js';

export async function findAreasForFrameworkId({
  frameworkId,
  skillRepository,
  tubeRepository,
  thematicRepository,
  areaRepository,
}) {
  const areasWithCompetences = await areaRepository.findByFrameworkIdWithCompetences({ frameworkId });

  const competences = areasWithCompetences.flatMap((area) => area.competences);

  const competenceIds = competences.map(({ id: competenceId }) => competenceId);
  const thematics = await thematicRepository.findByCompetenceIds(competenceIds);

  const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds);
  const tubes = await tubeRepository.findActiveByRecordIds(tubeIds);

  const skillIds = tubes.flatMap((tube) => tube.skillIds);
  const skills = await skillRepository.findActiveByRecordIds(skillIds);

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
        allSkills: skills,
      }),
  );
}
