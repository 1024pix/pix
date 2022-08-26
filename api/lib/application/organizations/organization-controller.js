const tokenService = require('../../domain/services/token-service');
const usecases = require('../../domain/usecases');

const campaignManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-management-serializer');
const campaignReportSerializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer');
const groupSerializer = require('../../infrastructure/serializers/jsonapi/group-serializer');
const minimalMembershipSerializer = require('../../infrastructure/serializers/jsonapi/memberships/minimal-membership-serializer');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');
const userWithOrganizationLearnerSerializer = require('../../infrastructure/serializers/jsonapi/user-with-organization-learner-serializer');
const supOrganizationLearnerWarningSerializer = require('../../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer');
const TargetProfileForSpecifierSerializer = require('../../infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer');
const organizationMemberIdentitySerializer = require('../../infrastructure/serializers/jsonapi/organization-member-identity-serializer');
const organizationPlacesLotManagmentSerializer = require('../../infrastructure/serializers/jsonapi/organization/organization-places-lot-management-serializer');
const organizationPlacesLotSerializer = require('../../infrastructure/serializers/jsonapi/organization/organization-places-lot-serializer');
const organizationPlacesCapacitySerializer = require('../../infrastructure/serializers/jsonapi/organization-places-capacity-serializer');
const organizationParticipantsSerializer = require('../../infrastructure/serializers/jsonapi/organization/organization-participants-serializer');
const scoOrganizationParticipantsSerializer = require('../../infrastructure/serializers/jsonapi/organization/sco-organization-participants-serializer');
const supOrganizationParticipantsSerializer = require('../../infrastructure/serializers/jsonapi/organization/sup-organization-participants-serializer');
const targetProfileSummaryForAdminSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer');

const SupOrganizationLearnerParser = require('../../infrastructure/serializers/csv/sup-organization-learner-parser');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const {
  extractLocaleFromRequest,
  extractUserIdFromRequest,
} = require('../../infrastructure/utils/request-response-utils');
const moment = require('moment');
const certificationResultUtils = require('../../infrastructure/utils/csv/certification-results');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf');
const organizationForAdminSerializer = require('../../infrastructure/serializers/jsonapi/organization-for-admin-serializer');

module.exports = {
  async getOrganizationDetails(request) {
    const organizationId = request.params.id;

    const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
    return organizationForAdminSerializer.serialize(organizationDetails);
  },

  create: (request) => {
    const {
      name,
      type,
      email,
      'external-id': externalId,
      'province-code': provinceCode,
      'logo-url': logoUrl,
      'documentation-url': documentationUrl,
    } = request.payload.data.attributes;

    const superAdminUserId = extractUserIdFromRequest(request);
    return usecases
      .createOrganization({
        createdBy: superAdminUserId,
        name,
        type,
        externalId,
        provinceCode,
        logoUrl,
        email,
        documentationUrl,
      })
      .then(organizationSerializer.serialize);
  },

  async updateOrganizationInformation(request) {
    const organizationDeserialized = organizationSerializer.deserialize(request.payload);

    const organizationUpdated = await usecases.updateOrganizationInformation({
      organization: organizationDeserialized,
    });
    return organizationSerializer.serialize(organizationUpdated);
  },

  async findPaginatedFilteredOrganizations(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: organizations, pagination } = await usecases.findPaginatedFilteredOrganizations({
      filter: options.filter,
      page: options.page,
    });
    return organizationSerializer.serialize(organizations, pagination);
  },

  async findPaginatedFilteredCampaigns(request) {
    const organizationId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);
    const userId = request.auth.credentials.userId;

    if (options.filter.status === 'archived') {
      options.filter.ongoing = false;
      delete options.filter.status;
    }
    const { models: campaigns, meta } = await usecases.findPaginatedFilteredOrganizationCampaigns({
      organizationId,
      filter: options.filter,
      page: options.page,
      userId,
    });
    return campaignReportSerializer.serialize(campaigns, meta);
  },

  async findPaginatedCampaignManagements(request) {
    const organizationId = request.params.id;
    const { filter, page } = queryParamsUtils.extractParameters(request.query);

    const { models: campaigns, meta } = await usecases.findPaginatedCampaignManagements({
      organizationId,
      filter,
      page,
    });
    return campaignManagementSerializer.serialize(campaigns, meta);
  },

  async findPaginatedFilteredMemberships(request) {
    const organizationId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({
      organizationId,
      filter: options.filter,
      page: options.page,
    });
    return minimalMembershipSerializer.serialize(memberships, pagination);
  },

  async getOrganizationMemberIdentities(request) {
    const organizationId = request.params.id;
    const members = await usecases.getOrganizationMemberIdentities({ organizationId });
    return organizationMemberIdentitySerializer.serialize(members);
  },

  async getOrganizationPlacesCapacity(request) {
    const organizationId = request.params.id;
    const organizationPlacesCapacity = await usecases.getOrganizationPlacesCapacity({ organizationId });
    return organizationPlacesCapacitySerializer.serialize(organizationPlacesCapacity);
  },

  async findOrganizationPlacesLot(request) {
    const organizationId = request.params.id;
    const places = await usecases.findOrganizationPlacesLot({ organizationId });
    return organizationPlacesLotManagmentSerializer.serialize(places);
  },

  async createOrganizationPlacesLot(request, h) {
    const organizationId = request.params.id;
    const createdBy = request.auth.credentials.userId;
    const organizationPlacesLotData = await organizationPlacesLotSerializer.deserialize(request.payload);
    const organizationPlacesLot = await usecases.createOrganizationPlacesLot({
      organizationPlacesLotData,
      organizationId,
      createdBy,
    });
    return h.response(organizationPlacesLotManagmentSerializer.serialize(organizationPlacesLot)).code(201);
  },

  async downloadCertificationAttestationsForDivision(request, h) {
    const organizationId = request.params.id;
    const { division, isFrenchDomainExtension } = request.query;

    const attestations = await usecases.findCertificationAttestationsForDivision({
      organizationId,
      division,
    });

    const { buffer } = await certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
      certificates: attestations,
      isFrenchDomainExtension,
    });

    const now = moment();
    const fileName = `${now.format('YYYYMMDD')}_attestations_${division}.pdf`;

    return h
      .response(buffer)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  },

  async downloadCertificationResults(request, h) {
    const organizationId = request.params.id;
    const { division } = request.query;

    const certificationResults = await usecases.getScoCertificationResultsByDivision({ organizationId, division });

    const csvResult = await certificationResultUtils.getDivisionCertificationResultsCsv({ certificationResults });

    const now = moment();
    const fileName = `${now.format('YYYYMMDD')}_resultats_${division}.csv`;

    return h
      .response(csvResult)
      .header('Content-Type', 'text/csv;charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${fileName}"`);
  },

  async findTargetProfiles(request) {
    const organizationId = request.params.id;
    const targetProfiles = await usecases.getAvailableTargetProfilesForOrganization({ organizationId });
    return TargetProfileForSpecifierSerializer.serialize(targetProfiles);
  },

  async attachTargetProfiles(request, h) {
    const targetProfileIds = request.payload['target-profile-ids'];
    const organizationId = request.params.id;
    await usecases.attachTargetProfilesToOrganization({ organizationId, targetProfileIds });

    return h.response({}).code(204);
  },

  async getDivisions(request) {
    const organizationId = request.params.id;
    const divisions = await usecases.findDivisionsByOrganization({ organizationId });
    return divisionSerializer.serialize(divisions);
  },

  async getGroups(request) {
    const organizationId = request.params.id;
    const groups = await usecases.findGroupsByOrganization({ organizationId });
    return groupSerializer.serialize(groups);
  },

  async findPaginatedFilteredOrganizationLearners(request, h) {
    const organizationId = request.params.id;
    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    if (filter.divisions && !Array.isArray(filter.divisions)) {
      filter.divisions = [filter.divisions];
    }

    if (filter.groups && !Array.isArray(filter.groups)) {
      filter.groups = [filter.groups];
    }
    const { data, pagination } = await usecases.findPaginatedFilteredOrganizationLearners({
      organizationId,
      filter,
      page,
    });
    return h
      .response(userWithOrganizationLearnerSerializer.serialize(data, pagination))
      .header('Deprecation', 'true')
      .header(
        'Link',
        `/api/organizations/${request.params.id}/sco-participants or /api/organizations/${request.params.id}/sup-participants; rel="successor-version"`
      );
  },

  async findPaginatedFilteredScoParticipants(request) {
    const organizationId = request.params.id;
    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    if (filter.divisions && !Array.isArray(filter.divisions)) {
      filter.divisions = [filter.divisions];
    }

    const { data: scoOrganizationParticipants, pagination } = await usecases.findPaginatedFilteredScoParticipants({
      organizationId,
      filter,
      page,
    });
    return scoOrganizationParticipantsSerializer.serialize({ scoOrganizationParticipants, pagination });
  },

  async findPaginatedFilteredSupParticipants(request) {
    const organizationId = request.params.id;
    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    if (filter.groups && !Array.isArray(filter.groups)) {
      filter.groups = [filter.groups];
    }

    const { data: supOrganizationParticipants, pagination } = await usecases.findPaginatedFilteredSupParticipants({
      organizationId,
      filter,
      page,
    });
    return supOrganizationParticipantsSerializer.serialize({ supOrganizationParticipants, pagination });
  },

  async importOrganizationLearnersFromSIECLE(request, h) {
    const organizationId = request.params.id;
    const { format } = request.query;

    await usecases.importOrganizationLearnersFromSIECLEFormat({
      organizationId,
      payload: request.payload,
      format,
      i18n: request.i18n,
    });

    const response = h.response(null).code(204);
    if (h.request.path === `/api/organizations/${request.params.id}/schooling-registrations/import-siecle`) {
      response
        .header('Deprecation', 'true')
        .header(
          'Link',
          `/api/organizations/${request.params.id}/sco-organization-learners/import-siecle; rel="successor-version"`
        );
    }
    return response;
  },

  async importSupOrganizationLearners(request, h) {
    const organizationId = request.params.id;
    const buffer = request.payload;
    const supOrganizationLearnerParser = new SupOrganizationLearnerParser(buffer, organizationId, request.i18n);
    const warnings = await usecases.importSupOrganizationLearners({ supOrganizationLearnerParser });

    const response = h
      .response(supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings }))
      .code(200);
    if (h.request.path === `/api/organizations/${request.params.id}/schooling-registrations/import-csv`) {
      response
        .header('Deprecation', 'true')
        .header(
          'Link',
          `/api/organizations/${request.params.id}/sup-organization-learners/import-csv; rel="successor-version"`
        );
    }
    return response;
  },

  async replaceSupOrganizationLearners(request, h) {
    const organizationId = request.params.id;
    const buffer = request.payload;
    const supOrganizationLearnerParser = new SupOrganizationLearnerParser(buffer, organizationId, request.i18n);
    const warnings = await usecases.replaceSupOrganizationLearners({
      organizationId,
      supOrganizationLearnerParser,
    });

    const response = h
      .response(supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings }))
      .code(200);
    if (h.request.path === `/api/organizations/${request.params.id}/schooling-registrations/replace-csv`) {
      response
        .header('Deprecation', 'true')
        .header(
          'Link',
          `/api/organizations/${request.params.id}/sup-organization-learners/replace-csv; rel="successor-version"`
        );
    }
    return response;
  },

  async sendInvitations(request, h) {
    const organizationId = request.params.id;
    const emails = request.payload.data.attributes.email.split(',');
    const locale = extractLocaleFromRequest(request);

    const organizationInvitations = await usecases.createOrganizationInvitations({ organizationId, emails, locale });
    return h.response(organizationInvitationSerializer.serialize(organizationInvitations)).created();
  },

  async cancelOrganizationInvitation(request, h) {
    const organizationInvitationId = request.params.organizationInvitationId;
    await usecases.cancelOrganizationInvitation({ organizationInvitationId });
    return h.response().code(204);
  },

  async sendInvitationByLangAndRole(request, h) {
    const organizationId = request.params.id;
    const invitationInformation =
      await organizationInvitationSerializer.deserializeForCreateOrganizationInvitationAndSendEmail(request.payload);

    const organizationInvitation = await usecases.createOrganizationInvitationByAdmin({
      organizationId,
      email: invitationInformation.email,
      locale: invitationInformation.lang,
      role: invitationInformation.role,
    });
    return h.response(organizationInvitationSerializer.serialize(organizationInvitation)).created();
  },

  findPendingInvitations(request) {
    const organizationId = request.params.id;

    return usecases
      .findPendingOrganizationInvitations({ organizationId })
      .then((invitations) => organizationInvitationSerializer.serialize(invitations));
  },

  async getOrganizationLearnersCsvTemplate(request, h) {
    const organizationId = request.params.id;
    const token = request.query.accessToken;
    const userId = tokenService.extractUserId(token);
    const template = await usecases.getOrganizationLearnersCsvTemplate({
      userId,
      organizationId,
      i18n: request.i18n,
    });

    const response = h
      .response(template)
      .header('Content-Type', 'text/csv;charset=utf-8')
      .header('Content-Disposition', `attachment; filename=${request.i18n.__('csv-template.template-name')}.csv`);
    if (h.request.path === `/api/organizations/${request.params.id}/schooling-registrations/csv-template`) {
      response
        .header('Deprecation', 'true')
        .header(
          'Link',
          `/api/organizations/${request.params.id}/sup-organization-learners/csv-template; rel="successor-version"`
        );
    }
    return response;
  },

  async archiveOrganization(request) {
    const organizationId = request.params.id;
    const userId = extractUserIdFromRequest(request);
    const archivedOrganization = await usecases.archiveOrganization({ organizationId, userId });
    return organizationForAdminSerializer.serialize(archivedOrganization);
  },

  async getPaginatedParticipantsForAnOrganization(request) {
    const organizationId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);
    const results = await usecases.getPaginatedParticipantsForAnOrganization({
      organizationId,
      page: options.page,
      filters: options.filter,
    });
    return organizationParticipantsSerializer.serialize(results);
  },

  async findTargetProfileSummariesForAdmin(request) {
    const organizationId = request.params.id;
    const targetProfileSummaries = await usecases.findOrganizationTargetProfileSummariesForAdmin({
      organizationId,
    });
    return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries);
  },
};
