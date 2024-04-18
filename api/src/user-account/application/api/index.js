import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import { UpdateUserAccountLastLoggedAtDateApi } from './update-user-account-last-logged-at-date.api.js';

const updateUserAccountLastLoggedAtDate = new UpdateUserAccountLastLoggedAtDateApi(userLoginRepository);

/**
 * @typedef {object} UserAccountApi
 * @property {UpdateUserAccountLastLoggedAtDateApi} updateUserAccountLastLoggedAtDate
 */
const userAccountApi = {
  updateUserAccountLastLoggedAtDate: updateUserAccountLastLoggedAtDate.execute.bind(updateUserAccountLastLoggedAtDate),
};

export { userAccountApi };
