import * as courseSerializer from '../../infrastructure/serializers/jsonapi/course-serializer.js';
import * as courseService from '../../domain/services/course-service.js';
import { extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const get = function (request, h, dependencies = { courseService, courseSerializer }) {
  const courseId = request.params.id;
  const userId = extractUserIdFromRequest(request);

  return dependencies.courseService.getCourse({ courseId, userId }).then(dependencies.courseSerializer.serialize);
};

const courseController = { get };

export { courseController };
