import { NotFoundError } from '../../../shared/domain/errors.js';

export async function detachOrganizationsFromCombinedCourseBlueprint({
  organizationIds,
  combinedCourseBlueprintId,
  combinedCourseBlueprintRepository,
}) {
  const blueprint = await combinedCourseBlueprintRepository.findById({ id: combinedCourseBlueprintId });
  if (!blueprint) {
    throw new NotFoundError(`Combined course blueprint with id:${combinedCourseBlueprintId} not found`);
  }
  blueprint.detachOrganizations({ organizationIds });
  await combinedCourseBlueprintRepository.save({ combinedCourseBlueprint: blueprint });
}
