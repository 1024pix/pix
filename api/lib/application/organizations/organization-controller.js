const { PassThrough } = require('stream');

const organizationService = require('../../domain/services/organization-service');
const usecases = require('../../domain/usecases');

const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const organizationInvitationSerializer = require('../../infrastructure/serializers/jsonapi/organization-invitation-serializer');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const studentSerializer = require('../../infrastructure/serializers/jsonapi/student-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

const EXPORT_CSV_FILE_NAME = 'Pix - Export donnees partagees.csv';

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

  find(request) {
    const filters = {
      name: request.query['name'],
      type: request.query['type'],
      code: request.query['code']
    };
    const pagination = {
      page: request.query['page'] ? request.query['page'] : 1,
      pageSize: request.query['pageSize'] ? request.query['pageSize'] : 10,
    };

    return usecases.findOrganizations({ filters, pagination })
      .then((searchResultList) => {
        const meta = {
          page: searchResultList.page,
          pageSize: searchResultList.pageSize,
          itemsCount: searchResultList.totalResults,
          pagesCount: searchResultList.pagesCount,
        };
        return organizationSerializer.serialize(searchResultList.paginatedResults, meta);
      });
  },

  async findPaginatedCampaigns(request) {
    const organizationId = parseInt(request.params.id);
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: campaigns, pagination } = await usecases.findPaginatedOrganizationCampaigns({ organizationId, page: options.page });
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

  exportSharedSnapshotsAsCsv: async (request) => {
    const organizationId = parseInt(request.params.id);

    const stream = new PassThrough();

    stream.headers = {
      'Content-Type': 'text/csv;charset=utf-8',
      'Content-Disposition': `attachment; filename="${EXPORT_CSV_FILE_NAME}"`
    };

    await usecases.writeOrganizationSharedProfilesAsCsvToStream({
      organizationId,
      writableStream: stream
    });

    return stream;
  },

  findStudents: async (request) => {
    const organizationId = parseInt(request.params.id);

    return usecases.findOrganizationStudents({ organizationId })
      .then(studentSerializer.serialize);
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
