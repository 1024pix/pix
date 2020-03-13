const organizationService = require('../../domain/services/organization-service');
const usecases = require('../../domain/usecases');

const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const studentWithUserInfoSerializer = require('../../infrastructure/serializers/jsonapi/student-with-user-info-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

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
      'external-id': externalId,
      'province-code': provinceCode,
      'logo-url': logoUrl,
    } = request.payload.data.attributes;

    return usecases.createOrganization({ name, type, externalId, provinceCode, logoUrl })
      .then(organizationSerializer.serialize);
  },

  updateOrganizationInformation: (request) => {
    const id = request.payload.data.id;
    const {
      name,
      type,
      'logo-url': logoUrl,
      'external-id': externalId,
      'province-code': provinceCode,
      'is-managing-students': isManagingStudents,
    } = request.payload.data.attributes;

    return usecases.updateOrganizationInformation({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents })
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
    const { models: campaigns, pagination } = await usecases.findPaginatedFilteredOrganizationCampaigns({ organizationId, filter: options.filter, page: options.page });
    return campaignSerializer.serialize(campaigns, pagination, { ignoreCampaignReportRelationshipData : false });
  },

  getMemberships(request) {
    const organizationId = parseInt(request.params.id);

    return usecases.getOrganizationMemberships({ organizationId })
      .then(membershipSerializer.serialize);
  },

  async findTargetProfiles(request) {
    const requestedOrganizationId = parseInt(request.params.id);

    const targetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(requestedOrganizationId);
    return targetProfileSerializer.serialize(targetProfiles);
  },

  findStudents: async (request) => {
    const organizationId = parseInt(request.params.id);

    return usecases.findOrganizationStudentsWithUserInfos({ organizationId })
      .then(studentWithUserInfoSerializer.serialize);
  },

  importStudentsFromSIECLE(request) {
    const organizationId = parseInt(request.params.id);
    const buffer = request.payload;

    return usecases.importStudentsFromSIECLE({ organizationId, buffer })
      .then(() => null);
  },

  async sendInvitations(request, h) {
    const organizationId = request.params.id;
    const emails = request.payload.data.attributes.email.split(',');

    const organizationInvitations = await usecases.createOrganizationInvitations({ organizationId, emails });
    return h.response(organizationInvitationSerializer.serialize(organizationInvitations)).created();
  },

  async findPendingInvitations(request) {
    const organizationId = request.params.id;

    return usecases.findPendingOrganizationInvitations({ organizationId })
      .then((invitations) => organizationInvitationSerializer.serialize(invitations));
  }
};
