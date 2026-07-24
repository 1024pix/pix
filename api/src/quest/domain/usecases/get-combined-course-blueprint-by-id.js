import { NotFoundError } from '../../../shared/domain/errors.js';
import { AdminCombinedCourseBlueprintDetails } from '../models/combined-course-blueprints/value-objects/AdminCombinedCourseBlueprintDetails.js';
import { REQUIREMENT_TYPES } from '../models/quests/entities/Quest.js';

export const getCombinedCourseBlueprintById = async ({
  id,
  combinedCourseBlueprintRepository,
  moduleRepository,
  attestationRepository,
  learningContentRepository,
}) => {
  const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({ id });
  if (!combinedCourseBlueprint) {
    throw new NotFoundError('Combined course blueprint not found');
  }

  const moduleIds = combinedCourseBlueprint.quest.successRequirements
    .filter((requirement) => requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.PASSAGES)
    .map((requirement) => requirement.data.moduleId.data);

  const modules = await moduleRepository.getByIds({ moduleIds });
  const modulesById = Object.groupBy(modules, ({ id }) => id);

  const attestation = await attestationRepository.getByRewardId({ rewardId: combinedCourseBlueprint.quest.rewardId });

  const rewardRequirements = await Promise.all(
    combinedCourseBlueprint.rewardRequirements.map(async (requirements, index) => {
      const threshold = requirements?.threshold;
      const cappedTubeRequirementIds = requirements.cappedTubes.map((cappedTube) => cappedTube.tubeId);
      const cappedTubesLevelById = new Map(requirements.cappedTubes.map(({ tubeId, level }) => [tubeId, level]));

      const frameworks = await learningContentRepository.findByTubeIds({
        tubeIds: cappedTubeRequirementIds,
        locale: 'fr-fr',
      });
      const areas = frameworks.flatMap((framework) => framework.areas);

      const formattedAreas = areas.map((area) => ({
        ...area,
        competences: area.competences.map((competence) => ({
          ...competence,
          thematics: competence.thematics.map((thematic) => ({
            ...thematic,
            tubes: thematic.tubes
              .filter((tube) => cappedTubesLevelById.has(tube.id))
              .map((tube) => ({
                id: tube.id,
                level: cappedTubesLevelById.get(tube.id),
                name: tube.name,
                practicalTitle: tube.practicalTitle,
              })),
          })),
        })),
      }));

      return {
        id: combinedCourseBlueprint.id + '-reward-requirement-' + index,
        areas: formattedAreas,
        cappedTubesThreshold: threshold,
      };
    }),
  );

  return AdminCombinedCourseBlueprintDetails.buildFromBlueprint({
    combinedCourseBlueprint,
    modulesById,
    rewardRequirements,
    attestationLabel: attestation.label,
  });
};
