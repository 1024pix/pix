const userOrgaSettingsSerializer = require('../../infrastructure/serializers/jsonapi/user-orga-settings-serializer.js');
const { UserNotAuthorizedToCreateResourceError } = require('../../domain/errors.js');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async createOrUpdate(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const userId = request.params.id;
    const organizationId = request.payload.data.relationships.organization.data.id;

    if (userId !== authenticatedUserId) {
      throw new UserNotAuthorizedToCreateResourceError();
    }

    const result = await usecases.createOrUpdateUserOrgaSettings({ userId, organizationId });

    return userOrgaSettingsSerializer.serialize(result);
  },
};
