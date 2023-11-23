import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import * as autonomousCourseSerializer from '../../infrastructure/serializers/jsonapi/autonomous-course-serializer.js';

const save = async (request, h, dependencies = { requestResponseUtils, usecases, autonomousCourseSerializer }) => {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const autonomousCourseForCreation = {
    ...request.payload.data.attributes,
    ownerId: userId,
  };
  const autonomousCourseId = await dependencies.usecases.saveAutonomousCourse({
    autonomousCourse: autonomousCourseForCreation,
  });
  return h.response(dependencies.autonomousCourseSerializer.serializeId(autonomousCourseId)).created();
};

const autonomousCourseController = { save };

export { autonomousCourseController };
