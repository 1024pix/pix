import { usecases } from '../../domain/usecases/index.js';
/**
 * @module UserApi
 */

export const markLevelSevenInfoAsSeen = async ({ userId }) => {
  return usecases.rememberUserHasSeenLevelSevenInformation({ userId });
};

export const updateHasSeenNewDashboardInfo = async ({ userId }) => {
  return usecases.updateUserHasSeenNewDashboardInfo({ userId });
};
