const JOIN_ERRORS = [
  {
    shortCode: 'R11',
    message: 'Vous possédez déjà un compte Pix avec l\'adresse e-mail <br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code R11)',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION'
  },
  {
    shortCode: 'R12',
    message: 'Vous possédez déjà un compte Pix utilisé avec l\'identifiant <br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code R12)',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION'
  },
  {
    shortCode: 'R13',
    message: 'Vous possédez déjà un compte Pix via l\'ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l\'accès à ce compte à l\'aide de Pix Orga.',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION'
  },
  {
    shortCode: 'R31',
    message: 'Vous possédez déjà un compte Pix avec l\'adresse e-mail<br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code R31)',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION'
  },
  {
    shortCode: 'R32',
    message: 'Vous possédez déjà un compte Pix utilisé avec l\'identifiant<br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code R32)',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION'
  },
  {
    shortCode: 'R33',
    message: 'Vous possédez déjà un compte Pix via l\'ENT. Utilisez-le pour rejoindre le parcours.',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION'
  }
];

const REGISTER_ERRORS = [
  {
    shortCode: 'S51',
    message: 'Vous possédez déjà un compte Pix avec l\'adresse e-mail<br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code S51)',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION'
  },
  {
    shortCode: 'S52',
    message: 'Vous possédez déjà un compte Pix avec l\'identifiant<br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code S52)',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION'
  },
  {
    shortCode: 'S53',
    message: 'Vous possédez déjà un compte Pix via l\'ENT.<br>Utilisez-le pour rejoindre le parcours.',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION'
  },
  {
    shortCode: 'S61',
    message: 'Vous possédez déjà un compte Pix avec l\'adresse e-mail<br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code S61)',
    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION'
  },
  {
    shortCode: 'S62',
    message: 'Vous possédez déjà un compte Pix utilisé avec l\'identifiant<br>#VALUE#<br>Pour continuer, connectez-vous à ce compte ou demandez de l\'aide à un enseignant.<br>(Code S62)',
    code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION'
  },
  {
    shortCode: 'S63',
    message: 'Vous possédez déjà un compte Pix via l\'ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l\'accès à ce compte à l\'aide de Pix Orga.<br>(Code S63)',
    code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION'
  }
];

function getJoinErrors() {
  return JOIN_ERRORS;
}

function getJoinErrorsMessageByShortCode({ shortCode, value }) {
  let message = undefined;

  const error = JOIN_ERRORS.find((error) => error.shortCode === shortCode);
  if (error) {
    message = error.message.replace('#VALUE#', value);
  }

  return message;
}

function getRegisterErrors() {
  return REGISTER_ERRORS;
}

function getRegisterErrorsMessageByShortCode({ shortCode, value }) {
  let message = undefined;

  const error = REGISTER_ERRORS.find((error) => error.shortCode === shortCode);
  if (error) {
    message = error.message.replace('#VALUE#', value);
  }

  return message;
}

export {
  getJoinErrors,
  getJoinErrorsMessageByShortCode,
  getRegisterErrors,
  getRegisterErrorsMessageByShortCode
};
