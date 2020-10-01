const usecases = require('../../domain/usecases');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {

  async findPaginatedFilteredTargetProfiles(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: targetProfiles, pagination } = await usecases.findPaginatedFilteredTargetProfiles({ filter: options.filter, page: options.page });
    return targetProfileSerializer.serialize(targetProfiles, pagination);
  },
};
