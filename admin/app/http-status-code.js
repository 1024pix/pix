'use strict';

export const HttpStatusCodes = {
  BAD_REQUEST: { CODE: '400', MESSAGE: 'Les données envoyées ne sont pas au bon format.' },
  INTERNAL_SERVER_ERROR: {
    CODE: '500',
    MESSAGE: 'Le service est momentanément indisponible. Veuillez réessayer ultérieurement.'
  },
  UNAUTHORIZED: { CODE: '401' , MESSAGE: 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.' },
  FORBIDDEN: '403',
  NOT_FOUND: '404',
};

