import { organizationForAdminSerializer } from '../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';
import * as csvSerializer from '../../../src/shared/infrastructure/serializers/csv/csv-serializer.js';
import { extractUserIdFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

const createInBatch = async function (request, h) {
  const organizations = await csvSerializer.deserializeForOrganizationsImport(request.payload.path);

  const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({ organizations });

  return h.response(organizationForAdminSerializer.serialize(createdOrganizations)).code(204);
};

const archiveOrganization = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.id;
  const userId = extractUserIdFromRequest(request);
  const archivedOrganization = await usecases.archiveOrganization({ organizationId, userId });
  return dependencies.organizationForAdminSerializer.serialize(archivedOrganization);
};

const findChildrenOrganizationsForAdmin = async function (
  request,
  h,
  dependencies = { organizationForAdminSerializer },
) {
  const parentOrganizationId = request.params.organizationId;
  const childOrganizations = await usecases.findChildrenOrganizationsForAdmin({ parentOrganizationId });
  return dependencies.organizationForAdminSerializer.serialize(childOrganizations);
};

const organizationController = {
  archiveOrganization,
  createInBatch,
  findChildrenOrganizationsForAdmin,
};

export { organizationController };
