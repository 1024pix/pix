import { usecases } from '../../domain/usecases/index.js';
import * as userOrgaSettingsSerializer from '../../infrastructure/serializers/jsonapi/user-orga-settings-serializer.js';

const createOrUpdate = async function (request, h, dependencies = { userOrgaSettingsSerializer }) {
  const userId = request.params.id;
  const organizationId = request.payload.data.relationships.organization.data.id;
  const result = await usecases.createOrUpdateUserOrgaSettings({ userId, organizationId });

  return dependencies.userOrgaSettingsSerializer.serialize(result);
};

const userOrgaSettingsController = { createOrUpdate };

export { userOrgaSettingsController };
