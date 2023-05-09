import * as userOrgaSettingsSerializer from '../../infrastructure/serializers/jsonapi/user-orga-settings-serializer.js';
import { UserNotAuthorizedToCreateResourceError } from '../../domain/errors.js';
import { usecases } from '../../domain/usecases/index.js';

const createOrUpdate = async function (request, h, dependencies = { userOrgaSettingsSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const userId = request.params.id;
  const organizationId = request.payload.data.relationships.organization.data.id;

  if (userId !== authenticatedUserId) {
    throw new UserNotAuthorizedToCreateResourceError();
  }

  const result = await usecases.createOrUpdateUserOrgaSettings({ userId, organizationId });

  return dependencies.userOrgaSettingsSerializer.serialize(result);
};

export { createOrUpdate };
