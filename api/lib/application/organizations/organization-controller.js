const organizationService = require('../../domain/services/organization-service');
const usecases = require('../../domain/usecases');

const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const userWithSchoolingRegistrationSerializer = require('../../infrastructure/serializers/jsonapi/user-with-schooling-registration-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  getOrganizationDetails: (request) => {
    const organizationId = parseInt(request.params.id);

    return usecases.getOrganizationDetails({ organizationId })
      .then(organizationSerializer.serialize);
  },

  create: (request) => {
    const {
      name,
      type,
      email,
      'external-id': externalId,
      'province-code': provinceCode,
      'logo-url': logoUrl,
    } = request.payload.data.attributes;

    return usecases.createOrganization({ name, type, externalId, provinceCode, logoUrl, email })
      .then(organizationSerializer.serialize);
  },

  updateOrganizationInformation: (request) => {
    const id = request.payload.data.id;
    const {
      name,
      type,
      email,
      'logo-url': logoUrl,
      'external-id': externalId,
      'province-code': provinceCode,
      'is-managing-students': isManagingStudents,
    } = request.payload.data.attributes;

    return usecases.updateOrganizationInformation({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents, email })
      .then(organizationSerializer.serialize);
  },

  async findPaginatedFilteredOrganizations(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: organizations, pagination } = await usecases.findPaginatedFilteredOrganizations({ filter: options.filter, page: options.page });
    return organizationSerializer.serialize(organizations, pagination);
  },

  async findPaginatedFilteredCampaigns(request) {
    const organizationId = parseInt(request.params.id);
    const options = queryParamsUtils.extractParameters(request.query);

    if (options.filter.status === 'archived') {
      options.filter.ongoing = false;
      delete options.filter.status;
    }
    const { models: campaigns, meta } = await usecases.findPaginatedFilteredOrganizationCampaigns({ organizationId, filter: options.filter, page: options.page });
    return campaignSerializer.serialize(campaigns, meta, { ignoreCampaignReportRelationshipData : false });
  },

  async findPaginatedFilteredMemberships(request) {
    const organizationId = parseInt(request.params.id);
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({ organizationId, filter: options.filter, page: options.page });
    return membershipSerializer.serialize(memberships, pagination);
  },

  async findTargetProfiles(request) {
    const requestedOrganizationId = parseInt(request.params.id);

    const targetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(requestedOrganizationId);
    return targetProfileSerializer.serialize(targetProfiles);
  },

  async attachTargetProfiles(request, h) {
    const requestedOrganizationId = parseInt(request.params.id);
    const targetProfileIdsToAttach = request.payload.data.attributes['target-profiles-to-attach']
      .map((targetProfileToAttach) => parseInt(targetProfileToAttach));

    await usecases.attachTargetProfilesToOrganization({ organizationId: requestedOrganizationId, targetProfileIdsToAttach });
    return h.response().code(204);
  },

  async findPaginatedFilteredSchoolingRegistrations(request) {
    const organizationId = parseInt(request.params.id);
    const { filter, page } = queryParamsUtils.extractParameters(request.query);

    const { data, pagination } = await usecases.findPaginatedFilteredSchoolingRegistrations({ organizationId, filter, page });
    return userWithSchoolingRegistrationSerializer.serialize(data, pagination);
  },

  importSchoolingRegistrationsFromSIECLE(request) {
    const organizationId = parseInt(request.params.id);
    const buffer = request.payload;

    return usecases.importSchoolingRegistrationsFromSIECLE({ organizationId, buffer })
      .then(() => null);
  },

  async sendInvitations(request, h) {
    const organizationId = request.params.id;
    const emails = request.payload.data.attributes.email.split(',');
    const locale = extractLocaleFromRequest(request);

    const organizationInvitations = await usecases.createOrganizationInvitations({ organizationId, emails, locale });
    return h.response(organizationInvitationSerializer.serialize(organizationInvitations)).created();
  },

  async findPendingInvitations(request) {
    const organizationId = request.params.id;

    return usecases.findPendingOrganizationInvitations({ organizationId })
      .then((invitations) => organizationInvitationSerializer.serialize(invitations));
  }
};
