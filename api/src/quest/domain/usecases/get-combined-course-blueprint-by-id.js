import { NotFoundError } from '../../../shared/domain/errors.js';
import { AdminCombinedCourseBlueprintDetails } from '../models/combined-course-blueprints/value-objects/AdminCombinedCourseBlueprintDetails.js';
import { REQUIREMENT_TYPES } from '../models/quests/entities/Quest.js';

export const getCombinedCourseBlueprintById = async ({
  id,
  combinedCourseBlueprintRepository,
  moduleRepository,
  attestationRepository,
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

  return AdminCombinedCourseBlueprintDetails.buildFromBlueprint({
    combinedCourseBlueprint,
    modulesById,
    attestationLabel: attestation.label,
  });
};
