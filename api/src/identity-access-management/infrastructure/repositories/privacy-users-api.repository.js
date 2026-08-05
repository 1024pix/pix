import * as privacyUsersApi from '../../../privacy/application/api/users-api.js';

const canSelfDeleteAccount = async ({ userId, dependencies = { privacyUsersApi } }) => {
  return dependencies.privacyUsersApi.canSelfDeleteAccount({ userId });
};

export { canSelfDeleteAccount };
