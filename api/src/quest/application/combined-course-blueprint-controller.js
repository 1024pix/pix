import { usecases } from '../domain/usecases/index.js';
import * as adminCombinedCourseBlueprintDetailsSerializer from '../infrastructure/serializers/admin-combined-course-blueprint-details-serializer.js';
import * as combinedCourseBlueprintForCreationSerializer from '../infrastructure/serializers/combined-course-blueprint-for-creation-serializer.js';
import * as combinedCourseBlueprintForUpdateSerializer from '../infrastructure/serializers/combined-course-blueprint-for-update-serializer.js';
import * as combinedCourseBlueprintOrganizationSerializer from '../infrastructure/serializers/combined-course-blueprint-organization-serializer.js';
import * as combinedCourseBlueprintOverviewSerializer from '../infrastructure/serializers/combined-course-blueprint-overview-serializer.js';
import * as combinedCourseBlueprintSerializer from '../infrastructure/serializers/combined-course-blueprint-serializer.js';

const findAll = async (request, _, dependencies = { combinedCourseBlueprintSerializer }) => {
  const combinedCourseBlueprints = await usecases.findCombinedCourseBlueprints();
  return dependencies.combinedCourseBlueprintSerializer.serialize(combinedCourseBlueprints);
};

const save = async (request, h, dependencies = { combinedCourseBlueprintForCreationSerializer }) => {
  const combinedCourseBlueprintForCreation =
    await dependencies.combinedCourseBlueprintForCreationSerializer.deserialize(request.payload);
  const combinedCourseBlueprint = await usecases.createCombinedCourseBlueprint({
    combinedCourseBlueprintForCreation,
  });
  return h
    .response(dependencies.combinedCourseBlueprintForCreationSerializer.serialize(combinedCourseBlueprint))
    .created();
};

const update = async (request, h, dependencies = { combinedCourseBlueprintForUpdateSerializer }) => {
  const combinedCourseBlueprintForUpdate = await dependencies.combinedCourseBlueprintForUpdateSerializer.deserialize(
    request.payload,
  );
  await usecases.updateCombinedCourseBlueprint({
    combinedCourseBlueprintId: request.params.blueprintId,
    combinedCourseBlueprintForUpdate,
  });
  return h.response().code(204);
};

const getById = async (request, _, dependencies = { adminCombinedCourseBlueprintDetailsSerializer }) => {
  const combinedCourseBlueprint = await usecases.getCombinedCourseBlueprintById({ id: request.params.blueprintId });
  return dependencies.adminCombinedCourseBlueprintDetailsSerializer.serialize(combinedCourseBlueprint);
};

const detachOrganization = async (request, h) => {
  await usecases.detachOrganizationFromCombinedCourseBlueprint({
    combinedCourseBlueprintId: request.params.blueprintId,
    organizationId: request.params.organizationId,
  });
  return h.response().code(204);
};

const attachOrganizations = async (request, h, dependencies = { combinedCourseBlueprintOrganizationSerializer }) => {
  const combinedCourseBlueprintId = request.params.blueprintId;
  const results = await usecases.attachOrganizationsToCombinedCourseBlueprint({
    combinedCourseBlueprintId,
    organizationIds: request.payload['organization-ids'],
  });
  return h
    .response(
      dependencies.combinedCourseBlueprintOrganizationSerializer.serialize({ ...results, combinedCourseBlueprintId }),
    )
    .code(201);
};

const findByOrganizationId = async (request, _, dependencies = { combinedCourseBlueprintSerializer }) => {
  const combinedCourseBlueprint = await usecases.findByOrganizationId({
    organizationId: request.params.organizationId,
  });
  return dependencies.combinedCourseBlueprintSerializer.serialize(combinedCourseBlueprint);
};

const findOverviewById = async (request, _, dependencies = { combinedCourseBlueprintOverviewSerializer }) => {
  const combinedCourseBlueprint = await usecases.findCombinedCourseBlueprintById({
    id: request.params.blueprintId,
  });
  return dependencies.combinedCourseBlueprintOverviewSerializer.serialize(combinedCourseBlueprint);
};

const combinedCourseBlueprintController = {
  findAll,
  save,
  update,
  getById,
  detachOrganization,
  attachOrganizations,
  findByOrganizationId,
  findOverviewById,
};

export { combinedCourseBlueprintController };
