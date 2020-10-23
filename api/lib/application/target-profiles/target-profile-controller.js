const usecases = require('../../domain/usecases');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {

  async findPaginatedFilteredTargetProfiles(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: targetProfiles, pagination } = await usecases.findPaginatedFilteredTargetProfiles({ filter: options.filter, page: options.page });
    return targetProfileSerializer.serialize(targetProfiles, pagination);
  },

  async getTargetProfileDetails(request) {
    const targetProfileId = parseInt(request.params.id);
    const targetProfilesDetails = await usecases.getTargetProfileDetails({ targetProfileId });
    return targetProfileSerializer.serialize(targetProfilesDetails);
  },

  async findPaginatedFilteredTargetProfileOrganizations(request) {
    const targetProfileId = parseInt(request.params.id);
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: organizations, pagination } = await usecases.findPaginatedFilteredTargetProfileOrganizations({ targetProfileId, filter: options.filter, page: options.page });
    return organizationSerializer.serialize(organizations, pagination);
  },
};
