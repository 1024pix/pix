import { User } from '../../domain/models/User.js';

import * as injectedUsersApi from '../../../identity-access-management/application/api/users-api.js';

export async function getByIds({ userIds, usersApi = injectedUsersApi } = {}) {
  const userDTOs = await usersApi.getActiveByUserIds({ userIds });

  return userDTOs.map((userDTO) => new User(userDTO));
}
