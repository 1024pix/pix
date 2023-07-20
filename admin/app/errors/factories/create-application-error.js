import { ApplicationError } from 'pix-admin/errors/application-error';

const ERROR_CODES_MAP_TO_I18N_KEY = {
  access_denied: 'Nous vous informons que la transmission de vos données, précisées à la page précédente, est indispensable pour pouvoir accéder au service et l\'utiliser.',
};

function withCodeAndDescription({ code, description}) {
  let message = description;
  const translationKey = ERROR_CODES_MAP_TO_I18N_KEY[code];
  if (translationKey) {
    message = translationKey;
  }

  return new ApplicationError({ message, extras: { code, description } });
}

export const createTranslatedApplicationError = {
  withCodeAndDescription,
};
