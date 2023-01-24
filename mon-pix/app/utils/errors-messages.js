const JOIN_ERRORS = [
  {
    shortCode: 'R11',
    message: 'api-error-messages.join-error.r11',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
  },
  {
    shortCode: 'R12',
    message: 'api-error-messages.join-error.r12',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
  },
  {
    shortCode: 'R13',
    message: 'api-error-messages.join-error.r13',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
  },
  {
    shortCode: 'R31',
    message: 'api-error-messages.join-error.r31',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION',
  },
  {
    shortCode: 'R32',
    message: 'api-error-messages.join-error.r32',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
  },
  {
    shortCode: 'R33',
    message: 'api-error-messages.join-error.r33',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
  },
  {
    shortCode: 'R70',
    message: 'api-error-messages.join-error.r70',
    code: 'USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION',
  },
];

const REGISTER_ERRORS = [
  {
    shortCode: 'S50',
    message: 'api-error-messages.register-error.s50',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_IN_DB',
  },
  {
    shortCode: 'S51',
    message: 'api-error-messages.register-error.s51',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION',
  },
  {
    shortCode: 'S52',
    message: 'api-error-messages.register-error.s52',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
  },
  {
    shortCode: 'S53',
    message: 'api-error-messages.register-error.s53',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
  },
  {
    shortCode: 'S61',
    message: 'api-error-messages.register-error.s61',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
  },
  {
    shortCode: 'S62',
    message: 'api-error-messages.register-error.s62',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
  },
  {
    shortCode: 'S63',
    message: 'api-error-messages.register-error.s63',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
  },
];

function getJoinErrorsMessageByShortCode({ shortCode }) {
  const error = JOIN_ERRORS.find((error) => error.shortCode === shortCode);
  return error.message;
}

function getRegisterErrorsMessageByShortCode({ shortCode }) {
  const error = REGISTER_ERRORS.find((error) => error.shortCode === shortCode);
  return error.message;
}

export { getJoinErrorsMessageByShortCode, getRegisterErrorsMessageByShortCode };
