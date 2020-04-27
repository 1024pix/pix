const userOrgaSettingsSerializer = require('../../infrastructure/serializers/jsonapi/user-orga-settings-serializer');
const { UserNotAuthorizedToCreateResourceError } = require('../../domain/errors');
const usecases = require('../../domain/usecases');

module.exports = {

  async createOrUpdate(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const userId = parseInt(request.params.id);
    const organizationId = request.payload.data.relationships.organization.data.id;

    if (userId !== authenticatedUserId) {
      throw new UserNotAuthorizedToCreateResourceError();
    }

    const result = await usecases.createOrUpdateUserOrgaSettings({ userId, organizationId });

    return userOrgaSettingsSerializer.serialize(result);
  }
};
