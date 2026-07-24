import { FrameworkForCappedTubes } from '../../domain/models/combined-course-blueprints/value-objects/FrameworkForCappedTubes.js';

export const findByTubeIds = async ({ tubeIds, learningContentApi }) => {
  const learningContent = await learningContentApi.findByTubeIds({ tubeIds, locale: 'fr-fr' });
  return toDomain(learningContent);
};
const toDomain = (learningContent) => {
  return learningContent.learningContentDTO.frameworkDTOs.map((framework) => {
    return new FrameworkForCappedTubes({
      id: framework.id,
      name: framework.name,
      areas: framework.areaDTOs.map((areaDTO) => ({
        id: areaDTO.id,
        title: areaDTO.title,
        code: areaDTO.code,
        color: areaDTO.color,
        competences: areaDTO.competenceDTOs.map((competenceDTO) => ({
          id: competenceDTO.id,
          name: competenceDTO.name,
          index: competenceDTO.index,
          thematics: competenceDTO.thematicDTOs.map((thematicDTO) => ({
            id: thematicDTO.id,
            name: thematicDTO.name,
            index: thematicDTO.index,
            tubes: thematicDTO.tubeDTOs,
          })),
        })),
      })),
    });
  });
};
