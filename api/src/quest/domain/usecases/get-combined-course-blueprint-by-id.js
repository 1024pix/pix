import { NotFoundError } from '../../../shared/domain/errors.js';
import { FrameworkNotFoundError } from '../errors.js';
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
      const name = requirements?.name;
      const cappedTubesLevelById = requirements.cappedTubes.map(({ tubeId, level }) => [tubeId, level]);

      const formattedAreas = await learningContentRepository.findAreasForTubeIds({
        tubesWithLevel: cappedTubesLevelById,
      });

      if (!formattedAreas.length) {
        throw new FrameworkNotFoundError();
      }

      return {
        id: combinedCourseBlueprint.id + '-reward-requirement-' + index,
        areas: formattedAreas,
        cappedTubesThreshold: threshold,
        name,
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
