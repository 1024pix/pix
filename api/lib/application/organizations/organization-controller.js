import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import { usecases } from '../../domain/usecases/index.js';

import * as campaignManagementSerializer from '../../infrastructure/serializers/jsonapi/campaign-management-serializer.js';
import * as divisionSerializer from '../../infrastructure/serializers/jsonapi/division-serializer.js';
import * as groupSerializer from '../../infrastructure/serializers/jsonapi/group-serializer.js';
import * as membershipSerializer from '../../infrastructure/serializers/jsonapi/membership-serializer.js';
import * as organizationSerializer from '../../infrastructure/serializers/jsonapi/organization-serializer.js';
import * as organizationInvitationSerializer from '../../infrastructure/serializers/jsonapi/organization-invitation-serializer.js';
import * as organizationMemberIdentitySerializer from '../../infrastructure/serializers/jsonapi/organization-member-identity-serializer.js';
import * as targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';

import * as queryParamsUtils from '../../infrastructure/utils/query-params-utils.js';
import {
  extractUserIdFromRequest,
  extractLocaleFromRequest,
} from '../../infrastructure/utils/request-response-utils.js';
import { getDivisionCertificationResultsCsv } from '../../infrastructure/utils/csv/certification-results/get-division-certification-results-csv.js';
import * as organizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js';

import * as csvSerializer from '../../infrastructure/serializers/csv/csv-serializer.js';

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

const findPaginatedCampaignManagements = async function (
  request,
  h,
  dependencies = {
    queryParamsUtils,
    campaignManagementSerializer,
  },
) {
  const organizationId = request.params.id;
  const { filter, page } = dependencies.queryParamsUtils.extractParameters(request.query);

  const { models: campaigns, meta } = await usecases.findPaginatedCampaignManagements({
    organizationId,
    filter,
    page,
  });
  return dependencies.campaignManagementSerializer.serialize(campaigns, meta);
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

const downloadCertificationResults = async function (
  request,
  h,
  dependencies = { getDivisionCertificationResultsCsv },
) {
  const organizationId = request.params.id;
  const { division } = request.query;

  const certificationResults = await usecases.getScoCertificationResultsByDivision({ organizationId, division });

  const csvResult = await dependencies.getDivisionCertificationResultsCsv({
    division,
    certificationResults,
    i18n: request.i18n,
  });

  return h
    .response(csvResult.content)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
};

const attachTargetProfiles = async function (request, h) {
  const targetProfileIds = request.payload['target-profile-ids'];
  const organizationId = request.params.id;
  await usecases.attachTargetProfilesToOrganization({ organizationId, targetProfileIds });

  return h.response({}).code(204);
};

const getDivisions = async function (request) {
  const organizationId = request.params.id;
  const divisions = await usecases.findDivisionsByOrganization({ organizationId });
  return divisionSerializer.serialize(divisions);
};

const getGroups = async function (request) {
  const organizationId = request.params.id;
  const groups = await usecases.findGroupsByOrganization({ organizationId });
  return groupSerializer.serialize(groups);
};

const importOrganizationLearnersFromSIECLE = async function (request, h) {
  const organizationId = request.params.id;
  const { format } = request.query;

  await usecases.importOrganizationLearnersFromSIECLEFormat({
    organizationId,
    payload: request.payload,
    format,
    i18n: request.i18n,
  });

  return h.response(null).code(204);
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

const getOrganizationLearnersCsvTemplate = async function (request, h, dependencies = { tokenService }) {
  const organizationId = request.params.id;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);
  const template = await usecases.getOrganizationLearnersCsvTemplate({
    userId,
    organizationId,
    i18n: request.i18n,
  });

  return h
    .response(template)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${request.i18n.__('csv-template.template-name')}.csv`);
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
  attachTargetProfiles,
  cancelOrganizationInvitation,
  create,
  createInBatch,
  downloadCertificationResults,
  findChildrenOrganizationsForAdmin,
  findPaginatedCampaignManagements,
  findPaginatedFilteredMemberships,
  findPaginatedFilteredMembershipsForAdmin,
  findPaginatedFilteredOrganizations,
  findPendingInvitations,
  findTargetProfileSummariesForAdmin,
  getDivisions,
  getGroups,
  getOrganizationLearnersCsvTemplate,
  getOrganizationMemberIdentities,
  importOrganizationLearnersFromSIECLE,
  resendInvitation,
  sendInvitationByLangAndRole,
  sendInvitations,
};

export { organizationController };
