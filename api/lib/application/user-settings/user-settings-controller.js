import { usecases } from '../../domain/usecases/index.js';

import * as UserSettingsSerializer from '../../infrastructure/serializers/jsonapi/user-settings-serializer.js';

const getUserSettings = async function (request, h, dependencies = { UserSettingsSerializer }) {
  const { userId } = request.params;

  const userSettings = await usecases.getUserSettings({ userId });

  return h.response(dependencies.UserSettingsSerializer.serialize(userSettings));
};

const updateUserColor = async function (request, h, dependencies = { UserSettingsSerializer }) {
  const { userId } = request.auth.credentials;
  const { color } = dependencies.UserSettingsSerializer.deserialize(request.payload);

  const updatedUserSettings = await usecases.updateUserColor({ userId, color });

  return h.response(dependencies.UserSettingsSerializer.serialize(updatedUserSettings)).created();
};

const userSettingsController = { getUserSettings, updateUserColor };
export { userSettingsController };
