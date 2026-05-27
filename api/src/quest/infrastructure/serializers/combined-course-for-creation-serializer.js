import { CombinedCourseForCreation } from '../../domain/models/combined-course/CombinedCourseForCreation.js';

const deserialize = function (payload) {
  const organizationId = parseInt(payload.data.relationships.organization.data.id) || null;
  const blueprintId = parseInt(payload.data.relationships['combined-course-blueprint'].data.id) || null;
  const { name } = payload.data.attributes;

  return new CombinedCourseForCreation({ organizationId, name, blueprintId });
};

export { deserialize };
