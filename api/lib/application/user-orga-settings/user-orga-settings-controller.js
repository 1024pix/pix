const userOrgaSettingsSerializer = require('../../infrastructure/serializers/jsonapi/user-orga-settings-serializer');
const { UserNotAuthorizedToCreateResourceError } = require('../../domain/errors');
const usecases = require('../../domain/usecases');

module.exports = {

  async create(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;
    const userId = request.payload.data.relationships.user.data.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    if (authenticatedUserId !== userId) {
      throw new UserNotAuthorizedToCreateResourceError();
    }

    const result = await usecases.createUserOrgaSettings({ userId, organizationId });

    return h.response(userOrgaSettingsSerializer.serialize(result)).created();
  }
};
