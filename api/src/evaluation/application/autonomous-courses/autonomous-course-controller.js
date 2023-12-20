import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import * as autonomousCourseSerializer from '../../infrastructure/serializers/jsonapi/autonomous-course-serializer.js';
import * as autonomousCoursePaginatedListSerializer from '../../infrastructure/serializers/jsonapi/autonomous-course-paginated-list-serializer.js';

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

const getById = async function (request, h, dependencies = { usecases, autonomousCourseSerializer }) {
  const { autonomousCourseId } = request.params;
  const autonomousCourse = await usecases.getAutonomousCourse({ autonomousCourseId });
  return dependencies.autonomousCourseSerializer.serialize(autonomousCourse);
};

const findPaginatedList = async (
  request,
  h,
  dependencies = { queryParamsUtils, usecases, autonomousCoursePaginatedListSerializer },
) => {
  const { page } = dependencies.queryParamsUtils.extractParameters(request.query);
  const { autonomousCourses, meta } = await dependencies.usecases.findAllPaginatedAutonomousCourses({ page });
  return dependencies.autonomousCoursePaginatedListSerializer.serialize(autonomousCourses, meta);
};

const autonomousCourseController = { save, getById, findPaginatedList };

export { autonomousCourseController };
