const usecases = require('../../domain/usecases');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const targetProfileWithLearningContentSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-with-learning-content-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const badgeSerializer = require('../../infrastructure/serializers/jsonapi/badge-serializer');
const stageSerializer = require('../../infrastructure/serializers/jsonapi/stage-serializer');
module.exports = {

  async findPaginatedFilteredTargetProfiles(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: targetProfiles, pagination } = await usecases.findPaginatedFilteredTargetProfiles({ filter: options.filter, page: options.page });
    return targetProfileSerializer.serialize(targetProfiles, pagination);
  },

  async getTargetProfileDetails(request) {
    const targetProfileId = request.params.id;
    const targetProfilesDetails = await usecases.getTargetProfileDetails({ targetProfileId });
    return targetProfileWithLearningContentSerializer.serialize(targetProfilesDetails);
  },

  async findPaginatedFilteredTargetProfileOrganizations(request) {
    const targetProfileId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: organizations, pagination } = await usecases.findPaginatedFilteredTargetProfileOrganizations({ targetProfileId, filter: options.filter, page: options.page });
    return organizationSerializer.serialize(organizations, pagination);
  },

  async findTargetProfileBadges(request) {
    const targetProfileId = request.params.id;

    const badges = await usecases.findTargetProfileBadges({ targetProfileId });
    return badgeSerializer.serialize(badges);
  },

  async attachOrganizations(request, h) {
    const organizationIds = request.payload['organization-ids'];
    const targetProfileId = request.params.id;
    await usecases.attachOrganizationsToTargetProfile({ targetProfileId, organizationIds });
    return h.response({}).code(204);
  },

  async updateTargetProfileName(request, h) {
    const id = request.params.id;
    const { name } = request.payload.data.attributes;
    await usecases.updateTargetProfileName({ id, name });
    return h.response({}).code(204);
  },

  async outdateTargetProfile(request, h) {
    const id = request.params.id;

    await usecases.outdateTargetProfile({ id });
    return h.response({}).code(204);
  },

  async createTargetProfile(request) {
    const targetProfileData = targetProfileSerializer.deserialize(request.payload);

    const targetProfile = await usecases.createTargetProfile({ targetProfileData });

    return targetProfileWithLearningContentSerializer.serialize(targetProfile);
  },

  async findByTargetProfileId(request) {
    const targetProfileId = request.params.id;

    const stages = await usecases.findTargetProfileStages({ targetProfileId });
    return stageSerializer.serialize(stages);
  },
};
