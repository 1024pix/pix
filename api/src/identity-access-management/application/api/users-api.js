import { usecases } from '../../domain/usecases/index.js';
import { UserDTO } from './models/UserDTO.js';
/**
 * @module UserApi
 */

export const markLevelSevenInfoAsSeen = async ({ userId }) => {
  return usecases.rememberUserHasSeenLevelSevenInformation({ userId });
};

export const markNewDashboardInfoAsSeen = async ({ userId }) => {
  return usecases.markUserHasSeenNewDashboardInfo({ userId });
};

export const markNewDashboardInfoAsSeen = async ({ userId }) => {
  return usecases.markUserHasSeenNewDashboardInfo({ userId });
};

export const getUserDetailsByUserIds = async ({ userIds }) => {
  const users = await usecases.getUserDetailsByUserIds({ userIds });
  return users.map((user) => new UserDTO(user));
};
