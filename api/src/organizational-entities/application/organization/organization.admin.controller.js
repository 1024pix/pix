import { usecases } from '../../domain/usecases/index.js';
import { organizationForAdminSerializer } from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';

const attachChildOrganization = async function (request, h) {
  const { childOrganizationId } = request.payload;
  const { organizationId: parentOrganizationId } = request.params;

  await usecases.attachChildOrganizationToOrganization({ childOrganizationId, parentOrganizationId });

  return h.response().code(204);
};

const addOrganizationFeatureInBatch = async function (request, h) {
  await usecases.addOrganizationFeatureInBatch({ filePath: request.payload.path });
  return h.response().code(204);
};

const getOrganizationDetails = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.id;

  const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
  return dependencies.organizationForAdminSerializer.serialize(organizationDetails);
};

const updateOrganizationsInBatch = async function (request, h) {
  await usecases.updateOrganizationsInBatch({ filePath: request.payload.path });
  return h.response().code(204);
};

export const organizationAdminController = {
  attachChildOrganization,
  addOrganizationFeatureInBatch,
  getOrganizationDetails,
  updateOrganizationsInBatch,
};
