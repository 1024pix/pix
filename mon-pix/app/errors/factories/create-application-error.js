import { ApplicationError } from 'mon-pix/errors/application-error';

const ERROR_CODES_MAP_TO_I18N_KEY = {
  access_denied: 'pages.login-or-register-oidc.error.data-sharing-refused',
};

function withCodeAndDescription({ code, description, intl: intlService }) {
  let message = description;
  const translationKey = ERROR_CODES_MAP_TO_I18N_KEY[code];

  if (translationKey) {
    message = intlService.t(translationKey);
  }

  return new ApplicationError({ message, extras: { code, description } });
}

export const createTranslatedApplicationError = {
  withCodeAndDescription,
};
