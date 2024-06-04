import * as courseService from '../../../lib/domain/services/course-service.js';
import { extractUserIdFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import * as courseSerializer from '../../infrastructure/serializers/jsonapi/course-serializer.js';

const get = async function (request, h, dependencies = { courseService, courseSerializer }) {
  const courseId = request.params.id;
  const userId = extractUserIdFromRequest(request);
  const course = await dependencies.courseService.getCourse({ courseId, userId });
  return dependencies.courseSerializer.serialize(course);
};

const courseController = { get };

export { courseController };
