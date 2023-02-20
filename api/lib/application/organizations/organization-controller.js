import tokenService from '../../domain/services/token-service';
import usecases from '../../domain/usecases';
import campaignManagementSerializer from '../../infrastructure/serializers/jsonapi/campaign-management-serializer';
import campaignReportSerializer from '../../infrastructure/serializers/jsonapi/campaign-report-serializer';
import divisionSerializer from '../../infrastructure/serializers/jsonapi/division-serializer';
import groupSerializer from '../../infrastructure/serializers/jsonapi/group-serializer';
import membershipSerializer from '../../infrastructure/serializers/jsonapi/membership-serializer';
import organizationSerializer from '../../infrastructure/serializers/jsonapi/organization-serializer';
import organizationInvitationSerializer from '../../infrastructure/serializers/jsonapi/organization-invitation-serializer';
import supOrganizationLearnerWarningSerializer from '../../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer';
import TargetProfileForSpecifierSerializer from '../../infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer';
import organizationMemberIdentitySerializer from '../../infrastructure/serializers/jsonapi/organization-member-identity-serializer';
import organizationPlacesLotManagmentSerializer from '../../infrastructure/serializers/jsonapi/organization/organization-places-lot-management-serializer';
import organizationPlacesLotSerializer from '../../infrastructure/serializers/jsonapi/organization/organization-places-lot-serializer';
import organizationPlacesCapacitySerializer from '../../infrastructure/serializers/jsonapi/organization-places-capacity-serializer';
import organizationParticipantsSerializer from '../../infrastructure/serializers/jsonapi/organization/organization-participants-serializer';
import scoOrganizationParticipantsSerializer from '../../infrastructure/serializers/jsonapi/organization/sco-organization-participants-serializer';
import supOrganizationParticipantsSerializer from '../../infrastructure/serializers/jsonapi/organization/sup-organization-participants-serializer';
import targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer';
import SupOrganizationLearnerParser from '../../infrastructure/serializers/csv/sup-organization-learner-parser';
import queryParamsUtils from '../../infrastructure/utils/query-params-utils';
import { extractLocaleFromRequest, extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils';
import dayjs from 'dayjs';
dayjs.extend(require('dayjs/plugin/customParseFormat'));
import certificationResultUtils from '../../infrastructure/utils/csv/certification-results';
import certificationAttestationPdf from '../../infrastructure/utils/pdf/certification-attestation-pdf';
import organizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/organization-for-admin-serializer';
import { mapCertificabilityByLabel } from './helpers';
import csvSerializer from '../../infrastructure/serializers/csv/csv-serializer';

export default {
  async getOrganizationDetails(request) {
    const organizationId = request.params.id;

    const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
    return organizationForAdminSerializer.serialize(organizationDetails);
  },

  async create(request) {
    const superAdminUserId = extractUserIdFromRequest(request);
    const organization = organizationForAdminSerializer.deserialize(request.payload);

    organization.createdBy = +superAdminUserId;

    const createdOrganization = await usecases.createOrganization({ organization });
    const serializedOrganization = organizationForAdminSerializer.serialize(createdOrganization);

    return serializedOrganization;
  },

  async createInBatch(request, h) {
    const organizations = await csvSerializer.deserializeForOrganizationsImport(request.payload.path);

    const createdOrganizations = await usecases.createOrganizationsWithTagsAndTargetProfiles({ organizations });

    return h.response(organizationForAdminSerializer.serialize(createdOrganizations)).code(204);
  },

  async updateOrganizationInformation(request) {
    const organizationDeserialized = organizationForAdminSerializer.deserialize(request.payload);

    const organizationUpdated = await usecases.updateOrganizationInformation({
      organization: organizationDeserialized,
    });
    return organizationForAdminSerializer.serialize(organizationUpdated);
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

  async findPaginatedFilteredMembershipsForAdmin(request) {
    const organizationId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({
      organizationId,
      filter: options.filter,
      page: options.page,
    });
    return membershipSerializer.serializeForAdmin(memberships, pagination);
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

  async deleteOrganizationPlacesLot(request, h) {
    const organizationPlaceId = request.params.placeId;
    const userId = request.auth.credentials.userId;

    await usecases.deleteOrganizationPlaceLot({ organizationPlaceId, userId });

    return h.response(null).code(204);
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

    const now = dayjs();
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

    const now = dayjs();
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

  async findPaginatedFilteredScoParticipants(request) {
    const organizationId = request.params.id;
    const { filter, page, sort } = queryParamsUtils.extractParameters(request.query);
    if (filter.divisions && !Array.isArray(filter.divisions)) {
      filter.divisions = [filter.divisions];
    }
    if (filter.connectionTypes && !Array.isArray(filter.connectionTypes)) {
      filter.connectionTypes = [filter.connectionTypes];
    }
    if (filter.certificability) {
      filter.certificability = mapCertificabilityByLabel(filter.certificability);
    }
    const { data: scoOrganizationParticipants, meta } = await usecases.findPaginatedFilteredScoParticipants({
      organizationId,
      filter,
      page,
      sort,
    });
    return scoOrganizationParticipantsSerializer.serialize({
      scoOrganizationParticipants,
      meta,
    });
  },

  async findPaginatedFilteredSupParticipants(request) {
    const organizationId = request.params.id;
    const { filter, page, sort } = queryParamsUtils.extractParameters(request.query);
    if (filter.groups && !Array.isArray(filter.groups)) {
      filter.groups = [filter.groups];
    }

    if (filter.certificability) {
      filter.certificability = mapCertificabilityByLabel(filter.certificability);
    }

    const { data: supOrganizationParticipants, meta } = await usecases.findPaginatedFilteredSupParticipants({
      organizationId,
      filter,
      page,
      sort,
    });
    return supOrganizationParticipantsSerializer.serialize({ supOrganizationParticipants, meta });
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

    return h.response(null).code(204);
  },

  async importSupOrganizationLearners(request, h) {
    const organizationId = request.params.id;
    const buffer = request.payload;
    const supOrganizationLearnerParser = new SupOrganizationLearnerParser(buffer, organizationId, request.i18n);
    const warnings = await usecases.importSupOrganizationLearners({ supOrganizationLearnerParser });

    return h.response(supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings })).code(200);
  },

  async replaceSupOrganizationLearners(request, h) {
    const organizationId = request.params.id;
    const buffer = request.payload;
    const supOrganizationLearnerParser = new SupOrganizationLearnerParser(buffer, organizationId, request.i18n);
    const warnings = await usecases.replaceSupOrganizationLearners({
      organizationId,
      supOrganizationLearnerParser,
    });

    return h.response(supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings })).code(200);
  },

  async sendInvitations(request, h) {
    const organizationId = request.params.id;
    const emails = request.payload.data.attributes.email.split(',');
    const locale = extractLocaleFromRequest(request);

    const organizationInvitations = await usecases.createOrganizationInvitations({ organizationId, emails, locale });
    return h.response(organizationInvitationSerializer.serialize(organizationInvitations)).created();
  },

  async resendInvitation(request, h) {
    const organizationId = request.params.id;
    const email = request.payload.data.attributes.email;
    const locale = extractLocaleFromRequest(request);

    const organizationInvitation = await usecases.resendOrganizationInvitation({
      organizationId,
      email,
      locale,
    });
    return h.response(organizationInvitationSerializer.serialize(organizationInvitation));
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

  async getPaginatedParticipantsForAnOrganization(request) {
    const organizationId = request.params.id;
    const { page, filter: filters, sort } = queryParamsUtils.extractParameters(request.query);

    if (filters.certificability) {
      filters.certificability = mapCertificabilityByLabel(filters.certificability);
    }

    const results = await usecases.getPaginatedParticipantsForAnOrganization({
      organizationId,
      page,
      filters,
      sort,
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
