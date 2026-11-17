import { databaseBuffer } from '../database-buffer.ts';
import { buildCombinedCourseBlueprint } from './build-combined-course-blueprint.js';
import { buildOrganization } from './build-organization.js';
import { buildQuest } from './build-quest.js';

const buildCombinedCourseBlueprintShare = function ({
  id = databaseBuffer.getNextId(),
  combinedCourseBlueprintId = buildCombinedCourseBlueprint({ questId: buildQuest().id }).id,
  organizationId = buildOrganization().id,
} = {}) {
  const values = {
    id,
    combinedCourseBlueprintId,
    organizationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'combined_course_blueprint_shares',
    values,
  });
};

export { buildCombinedCourseBlueprintShare };
