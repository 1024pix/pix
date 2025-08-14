import * as injectedUserApi from '../../../identity-access-management/application/api/users-api.js';export async function findById({ userId, userApi = injectedUserApi } = {}) {
  const users = await userApi.getActiveByUserIds({ userIds: [userId] });
  return users ? users[0] : null;
}
