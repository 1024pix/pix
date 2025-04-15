import { User } from '../../domain/models/User.js';

export async function getByIds({ userIds, usersApi }) {
  const userDTOs = await usersApi.getActiveByUserIds({ userIds });

  return userDTOs.map((userDTO) => new User(userDTO));
}
