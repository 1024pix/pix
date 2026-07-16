import _ from 'lodash';

import { FrameworkWithAreas } from '../models/FrameworkWithAreas.js';

export async function getLearningContentByTubeIds({
  tubeIds,
  sharedThematicRepository,
  sharedCompetenceRepository,
  sharedAreaRepository,
  sharedTubeRepository,
  frameworkRepository,
  locale,
}) {
  const tubes = await sharedTubeRepository.findByRecordIds(tubeIds, locale);
  const thematicIds = _.uniq(tubes.map((tube) => tube.thematicId));
  const thematics = await sharedThematicRepository.findByRecordIds(thematicIds, locale);
  thematics.forEach((thematic) => {
    thematic.tubes = tubes.filter((tube) => tube.thematicId === thematic.id);
  });

  const competenceIds = _.uniq(tubes.map((tube) => tube.competenceId));
  const competences = await sharedCompetenceRepository.findByRecordIds({ competenceIds, locale });

  competences.forEach((competence) => {
    competence.tubes = tubes.filter((tube) => {
      return tube.competenceId === competence.id;
    });
    competence.thematics = thematics.filter((thematic) => {
      return thematic.competenceId === competence.id;
    });
  });

  const allAreaIds = _.map(competences, (competence) => competence.areaId);
  const uniqAreaIds = _.uniq(allAreaIds, 'id');
  const areas = await sharedAreaRepository.findByRecordIds({ areaIds: uniqAreaIds, locale });
  for (const area of areas) {
    area.competences = competences.filter((competence) => {
      return competence.areaId === area.id;
    });
  }

  const frameworkIds = _.uniq(areas.map((area) => area.frameworkId));
  const frameworkDtos = await frameworkRepository.findByIds(frameworkIds);

  return frameworkDtos.map(
    ({ id, name }) =>
      new FrameworkWithAreas({
        id,
        name,
        areas: areas.filter((area) => area.frameworkId === id),
      }),
  );
}
