import { anonymizeUser } from './anonymize-user.usecase.js';
import { canSelfDeleteAccount } from './can-self-delete-account.usecase.js';

const usecases = {
  anonymizeUser,
  canSelfDeleteAccount,
};

export { usecases };
