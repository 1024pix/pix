const tokenService = require('../../domain/services/token-service');
const usecases = require('../../domain/usecases');

const campaignManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-management-serializer');
const campaignReportSerializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer');
const groupSerializer = require('../../infrastructure/serializers/jsonapi/group-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');
const userWithSchoolingRegistrationSerializer = require('../../infrastructure/serializers/jsonapi/user-with-schooling-registration-serializer');
const higherSchoolingRegistrationWarningSerializer = require('../../infrastructure/serializers/jsonapi/higher-schooling-registration-warnings-serializer');
const organizationAttachTargetProfilesSerializer = require('../../infrastructure/serializers/jsonapi/organization-attach-target-profiles-serializer');
const TargetProfileForSpecifierSerializer = require('../../infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer');
const organizationMemberIdentitySerializer = require('../../infrastructure/serializers/jsonapi/organization-member-identity-serializer');
const organizationPlaceSerializer = require('../../infrastructure/serializers/jsonapi/organization/organization-place-serializer');
const HigherSchoolingRegistrationParser = require('../../infrastructure/serializers/csv/higher-schooling-registration-parser');
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
    return membershipSerializer.serialize(memberships, pagination);
  },

  async getOrganizationMemberIdentities(request) {
    const organizationId = request.params.id;
    const members = await usecases.getOrganizationMemberIdentities({ organizationId });
    return organizationMemberIdentitySerializer.serialize(members);
  },

  async findOrganizationPlaces(request) {
    const organizationId = request.params.id;
    const places = await usecases.findOrganizationPlaces({ organizationId });
    return organizationPlaceSerializer.serialize(places);
  },

  async downloadCertificationAttestationsForDivision(request, h) {
    const organizationId = request.params.id;
    const { division } = request.query;

    const attestations = await usecases.findCertificationAttestationsForDivision({
      organizationId,
      division,
    });

    const { buffer } = await certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
      certificates: attestations,
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
      .header('Content-Disposition', `attachment; filename=${fileName}`);
  },

  async findTargetProfiles(request) {
    const organizationId = request.params.id;
    const targetProfiles = await usecases.getAvailableTargetProfilesForOrganization({ organizationId });
    return TargetProfileForSpecifierSerializer.serialize(targetProfiles);
  },

  async attachTargetProfiles(request, h) {
    const organizationId = request.params.id;
    const targetProfileIdsToAttach = request.payload.data.attributes['target-profiles-to-attach']
      // eslint-disable-next-line no-restricted-syntax
      .map((targetProfileToAttach) => parseInt(targetProfileToAttach));
    const results = await usecases.attachTargetProfilesToOrganization({
      organizationId,
      targetProfileIdsToAttach,
    });
    return h
      .response(organizationAttachTargetProfilesSerializer.serialize({ ...results, organizationId }))
      .code(results.attachedIds.length > 0 ? 201 : 200);
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

  async findPaginatedFilteredSchoolingRegistrations(request) {
    const organizationId = request.params.id;
    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    if (filter.divisions && !Array.isArray(filter.divisions)) {
      filter.divisions = [filter.divisions];
    }

    if (filter.groups && !Array.isArray(filter.groups)) {
      filter.groups = [filter.groups];
    }
    const { data, pagination } = await usecases.findPaginatedFilteredSchoolingRegistrations({
      organizationId,
      filter,
      page,
    });
    return userWithSchoolingRegistrationSerializer.serialize(data, pagination);
  },

  async importSchoolingRegistrationsFromSIECLE(request, h) {
    const organizationId = request.params.id;
    const { format } = request.query;

    await usecases.importSchoolingRegistrationsFromSIECLEFormat({
      organizationId,
      payload: request.payload,
      format,
      i18n: request.i18n,
    });
    return h.response(null).code(204);
  },

  async importHigherSchoolingRegistrations(request, h) {
    const organizationId = request.params.id;
    const buffer = request.payload;
    const higherSchoolingRegistrationParser = new HigherSchoolingRegistrationParser(
      buffer,
      organizationId,
      request.i18n
    );
    const warnings = await usecases.importHigherSchoolingRegistrations({ higherSchoolingRegistrationParser });
    const response = higherSchoolingRegistrationWarningSerializer.serialize({ id: organizationId, warnings });
    return h.response(response).code(200);
  },

  async replaceHigherSchoolingRegistrations(request, h) {
    const organizationId = request.params.id;
    const buffer = request.payload;
    const higherSchoolingRegistrationParser = new HigherSchoolingRegistrationParser(
      buffer,
      organizationId,
      request.i18n
    );
    const warnings = await usecases.replaceHigherSchoolingRegistrations({
      organizationId,
      higherSchoolingRegistrationParser,
    });
    const response = higherSchoolingRegistrationWarningSerializer.serialize({ id: organizationId, warnings });
    return h.response(response).code(200);
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
    const cancelledOrganizationInvitation = await usecases.cancelOrganizationInvitation({ organizationInvitationId });
    return h.response(organizationInvitationSerializer.serialize(cancelledOrganizationInvitation));
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

  async findPendingInvitations(request) {
    const organizationId = request.params.id;

    return usecases
      .findPendingOrganizationInvitations({ organizationId })
      .then((invitations) => organizationInvitationSerializer.serialize(invitations));
  },

  async getSchoolingRegistrationsCsvTemplate(request, h) {
    const organizationId = request.params.id;
    const token = request.query.accessToken;
    const userId = tokenService.extractUserId(token);
    const template = await usecases.getSchoolingRegistrationsCsvTemplate({
      userId,
      organizationId,
      i18n: request.i18n,
    });

    return h
      .response(template)
      .header('Content-Type', 'text/csv;charset=utf-8')
      .header('Content-Disposition', `attachment; filename=${request.i18n.__('csv-template.template-name')}.csv`);
  },

  async archiveOrganization(request) {
    const organizationId = request.params.id;
    const userId = extractUserIdFromRequest(request);
    const archivedOrganization = await usecases.archiveOrganization({ organizationId, userId });
    return organizationForAdminSerializer.serialize(archivedOrganization);
  },
};
