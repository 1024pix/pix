import userOrgaSettingsSerializer from '../../infrastructure/serializers/jsonapi/user-orga-settings-serializer';
import { UserNotAuthorizedToCreateResourceError } from '../../domain/errors';
import usecases from '../../domain/usecases';

export default {
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
