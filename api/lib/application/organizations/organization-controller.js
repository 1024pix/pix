import * as organizationSerializer from '../../../src/organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.js';
import { organizationForAdminSerializer } from '../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';
import * as csvSerializer from '../../../src/shared/infrastructure/serializers/csv/csv-serializer.js';
import {
  extractLocaleFromRequest,
  extractUserIdFromRequest,
} from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { organizationInvitationSerializer } from '../../../src/team/infrastructure/serializers/jsonapi/organization-invitation.serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import * as organizationMemberIdentitySerializer from '../../infrastructure/serializers/jsonapi/organization-member-identity-serializer.js';

const create = async function (request) {
  const superAdminUserId = extractUserIdFromRequest(request);
  const organization = organizationForAdminSerializer.deserialize(request.payload);

  organization.createdBy = +superAdminUserId;

  const createdOrganization = await usecases.createOrganization({ organization });
  const serializedOrganization = organizationForAdminSerializer.serialize(createdOrganization);

  return serializedOrganization;
};

const createInBatch = async function (request, h) {
  const organizations = await csvSerializer.deserializeForOrganizationsImport(request.payload.path);

  const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({ organizations });

  return h.response(organizationForAdminSerializer.serialize(createdOrganizations)).code(204);
};

const findPaginatedFilteredOrganizations = async function (request, h, dependencies = { organizationSerializer }) {
  const options = request.query;

  const { models: organizations, pagination } = await usecases.findPaginatedFilteredOrganizations({
    filter: options.filter,
    page: options.page,
  });
  return dependencies.organizationSerializer.serialize(organizations, pagination);
};

const getOrganizationMemberIdentities = async function (
  request,
  h,
  dependencies = { organizationMemberIdentitySerializer },
) {
  const organizationId = request.params.id;
  const members = await usecases.getOrganizationMemberIdentities({ organizationId });
  return dependencies.organizationMemberIdentitySerializer.serialize(members);
};

const resendInvitation = async function (request, h) {
  const organizationId = request.params.id;
  const email = request.payload.data.attributes.email;
  const locale = extractLocaleFromRequest(request);

  const organizationInvitation = await usecases.resendOrganizationInvitation({
    organizationId,
    email,
    locale,
  });
  return h.response(organizationInvitationSerializer.serialize(organizationInvitation));
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
  create,
  createInBatch,
  findChildrenOrganizationsForAdmin,
  findPaginatedFilteredOrganizations,
  getOrganizationMemberIdentities,
  resendInvitation,
};

export { organizationController };
