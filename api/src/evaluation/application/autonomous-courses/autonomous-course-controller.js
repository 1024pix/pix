import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import * as autonomousCoursePaginatedListSerializer from '../../infrastructure/serializers/jsonapi/autonomous-course-paginated-list-serializer.js';
import * as autonomousCourseSerializer from '../../infrastructure/serializers/jsonapi/autonomous-course-serializer.js';

const save = async (request, h, dependencies = { requestResponseUtils, usecases, autonomousCourseSerializer }) => {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  const deserializedPayload = await dependencies.autonomousCourseSerializer.deserialize(request.payload);

  const autonomousCourseForCreation = {
    ...deserializedPayload,
    ownerId: userId,
  };
  const autonomousCourseId = await dependencies.usecases.saveAutonomousCourse({
    autonomousCourse: autonomousCourseForCreation,
  });
  return h.response(dependencies.autonomousCourseSerializer.serializeId(autonomousCourseId)).created();
};

const update = async (request, h, dependencies = { usecases, autonomousCourseSerializer }) => {
  const autonomousCourseId = request.params.autonomousCourseId;
  const deserializedPayload = await dependencies.autonomousCourseSerializer.deserialize(request.payload);
  await dependencies.usecases.updateAutonomousCourse({
    autonomousCourse: {
      campaignId: autonomousCourseId,
      ...deserializedPayload,
    },
  });
  return h.response().code(204);
};

const getById = async function (request, h, dependencies = { usecases, autonomousCourseSerializer }) {
  const { autonomousCourseId } = request.params;
  const autonomousCourse = await usecases.getAutonomousCourse({ autonomousCourseId });
  return dependencies.autonomousCourseSerializer.serialize(autonomousCourse);
};

const findPaginatedList = async (request, h, dependencies = { usecases, autonomousCoursePaginatedListSerializer }) => {
  const { page } = request.query;
  const { autonomousCourses, meta } = await dependencies.usecases.findAllPaginatedAutonomousCourses({ page });
  return dependencies.autonomousCoursePaginatedListSerializer.serialize(autonomousCourses, meta);
};
const autonomousCourseController = { save, getById, update, findPaginatedList };
export { autonomousCourseController };
