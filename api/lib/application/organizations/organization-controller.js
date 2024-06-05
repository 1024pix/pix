import * as divisionSerializer from '../../../src/prescription/campaign/infrastructure/serializers/jsonapi/division-serializer.js';
import * as queryParamsUtils from '../../../src/shared/infrastructure/utils/query-params-utils.js';
import {
  extractLocaleFromRequest,
  extractUserIdFromRequest,
} from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as csvSerializer from '../../infrastructure/serializers/csv/csv-serializer.js';
import * as membershipSerializer from '../../infrastructure/serializers/jsonapi/membership-serializer.js';
import * as organizationInvitationSerializer from '../../infrastructure/serializers/jsonapi/organization-invitation-serializer.js';
import * as organizationMemberIdentitySerializer from '../../infrastructure/serializers/jsonapi/organization-member-identity-serializer.js';
import * as organizationSerializer from '../../infrastructure/serializers/jsonapi/organization-serializer.js';
import * as organizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js';
import * as targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';

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

const findPaginatedFilteredOrganizations = async function (
  request,
  h,
  dependencies = {
    organizationSerializer,
    queryParamsUtils,
  },
) {
  const options = dependencies.queryParamsUtils.extractParameters(request.query);

  const { models: organizations, pagination } = await usecases.findPaginatedFilteredOrganizations({
    filter: options.filter,
    page: options.page,
  });
  return dependencies.organizationSerializer.serialize(organizations, pagination);
};

const findPaginatedFilteredMembershipsForAdmin = async function (request) {
  const organizationId = request.params.id;
  const options = queryParamsUtils.extractParameters(request.query);

  const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({
    organizationId,
    filter: options.filter,
    page: options.page,
  });
  return membershipSerializer.serializeForAdmin(memberships, pagination);
};

const findPaginatedFilteredMemberships = async function (request) {
  const organizationId = request.params.id;
  const options = queryParamsUtils.extractParameters(request.query);

  const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({
    organizationId,
    filter: options.filter,
    page: options.page,
  });
  return membershipSerializer.serialize(memberships, pagination);
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

const getDivisions = async function (request) {
  const organizationId = request.params.id;
  const divisions = await usecases.findDivisionsByOrganization({ organizationId });
  return divisionSerializer.serialize(divisions);
};

const sendInvitations = async function (request, h) {
  const organizationId = request.params.id;
  const emails = request.payload.data.attributes.email.split(',');
  const locale = extractLocaleFromRequest(request);

  const organizationInvitations = await usecases.createOrganizationInvitations({ organizationId, emails, locale });
  return h.response(organizationInvitationSerializer.serialize(organizationInvitations)).created();
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

const cancelOrganizationInvitation = async function (request, h) {
  const organizationInvitationId = request.params.organizationInvitationId;
  await usecases.cancelOrganizationInvitation({ organizationInvitationId });
  return h.response().code(204);
};

const sendInvitationByLangAndRole = async function (request, h, dependencies = { organizationInvitationSerializer }) {
  const organizationId = request.params.id;
  const invitationInformation =
    await dependencies.organizationInvitationSerializer.deserializeForCreateOrganizationInvitationAndSendEmail(
      request.payload,
    );

  const organizationInvitation = await usecases.createOrganizationInvitationByAdmin({
    organizationId,
    email: invitationInformation.email,
    locale: invitationInformation.lang,
    role: invitationInformation.role,
  });
  return h.response(dependencies.organizationInvitationSerializer.serialize(organizationInvitation)).created();
};

const findPendingInvitations = function (request, h, dependencies = { organizationInvitationSerializer }) {
  const organizationId = request.params.id;

  return usecases
    .findPendingOrganizationInvitations({ organizationId })
    .then((invitations) => dependencies.organizationInvitationSerializer.serialize(invitations));
};

const archiveOrganization = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.id;
  const userId = extractUserIdFromRequest(request);
  const archivedOrganization = await usecases.archiveOrganization({ organizationId, userId });
  return dependencies.organizationForAdminSerializer.serialize(archivedOrganization);
};

const findTargetProfileSummariesForAdmin = async function (request) {
  const organizationId = request.params.id;
  const targetProfileSummaries = await usecases.findOrganizationTargetProfileSummariesForAdmin({
    organizationId,
  });
  return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries);
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
  cancelOrganizationInvitation,
  create,
  createInBatch,
  findChildrenOrganizationsForAdmin,
  findPaginatedFilteredMemberships,
  findPaginatedFilteredMembershipsForAdmin,
  findPaginatedFilteredOrganizations,
  findPendingInvitations,
  findTargetProfileSummariesForAdmin,
  getDivisions,
  getOrganizationMemberIdentities,
  resendInvitation,
  sendInvitationByLangAndRole,
  sendInvitations,
};

export { organizationController };
