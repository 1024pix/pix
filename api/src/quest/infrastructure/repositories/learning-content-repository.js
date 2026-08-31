import { AreaForCappedTubes } from '../../domain/models/combined-course-blueprints/value-objects/AreaForCappedTubes.js';

export const findAreasForTubeIds = async ({ tubesWithLevel, learningContentApi }) => {
  const levelByTubeId = new Map(tubesWithLevel);
  const tubeIds = [...levelByTubeId.keys()];

  const learningContent = await learningContentApi.findByTubeIds({ tubeIds, locale: 'fr-fr' });
  const frameworks = learningContent.learningContentDTO.frameworkDTOs;

  if (!frameworks.length) {
    return [];
  }

  const formattedAreas = frameworks.flatMap((framework) =>
    framework.areaDTOs.map((area) => ({
      ...area,
      competences: area.competenceDTOs.map((competence) => ({
        id: competence.id,
        name: competence.name,
        index: competence.index,
        thematics: competence.thematicDTOs.map((thematic) => ({
          id: thematic.id,
          name: thematic.name,
          index: thematic.index,
          tubes: thematic.tubeDTOs
            .filter((tube) => levelByTubeId.has(tube.id))
            .map((tube) => ({
              id: tube.id,
              level: levelByTubeId.get(tube.id),
              name: tube.name,
              practicalTitle: tube.practicalTitle,
            })),
        })),
      })),
    })),
  );

  return toDomain(formattedAreas);
};

const toDomain = (formattedAreas) => {
  return formattedAreas.map((area) => {
    return new AreaForCappedTubes({
      id: area.id,
      title: area.title,
      code: area.code,
      color: area.color,
      competences: area.competences.map((competence) => ({
        id: competence.id,
        name: competence.name,
        index: competence.index,
        thematics: competence.thematics.map((thematic) => ({
          id: thematic.id,
          name: thematic.name,
          index: thematic.index,
          tubes: thematic.tubes,
        })),
      })),
    });
  });
};
