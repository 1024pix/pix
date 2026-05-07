import { AreaForAdmin } from '../../../shared/domain/models/LearningContentForAdmin.js';

/** @param {import('./dependencies.js').Dependencies & {
 *   frameworkId: string
 *   frameworkName: string
 *   locale: string
 * }}
 */
export async function getFrameworkAreas({
  frameworkId,
  frameworkName,
  locale,
  sharedAreaRepository,
  frameworkRepository,
  sharedSkillRepository,
  sharedThematicRepository,
  sharedTubeRepository,
}) {
  if (!frameworkId) {
    const framework = await frameworkRepository.getByName(frameworkName);
    frameworkId = framework.id;
  }

  const areasWithCompetences = await sharedAreaRepository.findByFrameworkIdWithCompetences({ frameworkId, locale });

  const competences = areasWithCompetences.flatMap((area) => area.competences);

  const competenceIds = competences.map(({ id: competenceId }) => competenceId);
  const thematics = await sharedThematicRepository.findByCompetenceIds(competenceIds, locale);

  const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds);
  const tubes = await sharedTubeRepository.findActiveByRecordIds(tubeIds, locale);

  const skillIds = tubes.flatMap((tube) => tube.skillIds);
  const skills = await sharedSkillRepository.findActiveByRecordIds(skillIds);

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
