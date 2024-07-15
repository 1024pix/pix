import * as courseService from '../../domain/services/course-service.js';
import * as courseSerializer from '../../infrastructure/serializers/jsonapi/course-serializer.js';
import { extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const get = async function (request, h, dependencies = { courseService, courseSerializer }) {
  const courseId = request.params.id;
  const userId = extractUserIdFromRequest(request);
  const course = await dependencies.courseService.getCourse({ courseId, userId });
  return dependencies.courseSerializer.serialize(course);
};

const courseController = { get };

export { courseController };
