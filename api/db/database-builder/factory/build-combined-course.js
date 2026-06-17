import { databaseBuffer } from '../database-buffer.js';
import { buildCombinedCourseBlueprint } from './build-combined-course-blueprint.js';
import { buildOrganization } from './build-organization.js';
import { buildQuestForCombinedCourse } from './build-quest.js';

const buildCombinedCourse = function ({
  id = databaseBuffer.getNextId(),
  code = 'COMBINIX1',
  name = 'Mon parcours combiné',
  organizationId,
  description = 'Le but de ma quête',
  illustration = 'images/illustration.svg',
  createdAt = new Date(),
  updatedAt,
  combinedCourseBlueprintId,
  questId,
  deletedAt = null,
  deletedBy = null,
} = {}) {
  organizationId = organizationId ?? buildOrganization().id;
  questId = questId ?? buildQuestForCombinedCourse().id;
  combinedCourseBlueprintId = combinedCourseBlueprintId ?? buildCombinedCourseBlueprint().id;

  const values = {
    id,
    code,
    name,
    description,
    illustration,
    organizationId,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    questId,
    combinedCourseBlueprintId,
    deletedAt,
    deletedBy,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'combined_courses',
    values,
  });
};

export { buildCombinedCourse };
