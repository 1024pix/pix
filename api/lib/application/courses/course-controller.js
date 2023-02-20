import courseSerializer from '../../infrastructure/serializers/jsonapi/course-serializer';
import courseService from '../../../lib/domain/services/course-service';
import { extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils';

export default {
  get(request) {
    const courseId = request.params.id;
    const userId = extractUserIdFromRequest(request);

    return courseService.getCourse({ courseId, userId }).then(courseSerializer.serialize);
  },
};
