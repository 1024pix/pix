const usecases = require('../../domain/usecases');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const targetProfileWithLearningContentSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-with-learning-content-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const badgeSerializer = require('../../infrastructure/serializers/jsonapi/badge-serializer');
const badgeCreationSerializer = require('../../infrastructure/serializers/jsonapi/badge-creation-serializer');
const stageSerializer = require('../../infrastructure/serializers/jsonapi/stage-serializer');
const targetProfileAttachOrganizationSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer');

module.exports = {
  async findPaginatedFilteredTargetProfiles(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: targetProfiles, pagination } = await usecases.findPaginatedFilteredTargetProfiles({
      filter: options.filter,
      page: options.page,
    });
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

    const { models: organizations, pagination } = await usecases.findPaginatedFilteredTargetProfileOrganizations({
      targetProfileId,
      filter: options.filter,
      page: options.page,
    });
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
    const results = await usecases.attachOrganizationsToTargetProfile({ targetProfileId, organizationIds });

    return h.response(targetProfileAttachOrganizationSerializer.serialize({ ...results, targetProfileId })).code(200);
  },

  async attachOrganizationsFromExistingTargetProfile(request, h) {
    const existingTargetProfileId = request.payload['target-profile-id'];
    const targetProfileId = request.params.id;
    await usecases.attachOrganizationsFromExistingTargetProfile({ targetProfileId, existingTargetProfileId });
    return h.response({}).code(204);
  },

  async updateTargetProfile(request, h) {
    const id = request.params.id;
    const { name, description, comment, category } = request.payload.data.attributes;
    await usecases.updateTargetProfile({ id, name, description, comment, category });
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

  async createBadge(request, h) {
    const targetProfileId = request.params.id;
    const badgeCreation = await badgeCreationSerializer.deserialize(request.payload);

    // FIXME update usecase to accept a badgeCreation object
    // eslint-disable-next-line no-unused-vars
    const { campaignThreshold, skillSetThreshold, skillSetName, skillSetSkillsIds, ...badge } = badgeCreation;

    const createdBadge = await usecases.createBadge({ targetProfileId, badge });

    return h.response(badgeSerializer.serialize(createdBadge)).created();
  },
};
