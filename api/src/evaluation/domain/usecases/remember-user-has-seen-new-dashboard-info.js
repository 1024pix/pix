import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const rememberUserHasSeenNewDashboardInfo = function ({
  userId,
  userRepository = injectedRepositories.userRepository,
} = {}) {
  return userRepository.updateHasSeenNewDashboardInfo({ userId });
};

export { rememberUserHasSeenNewDashboardInfo };
