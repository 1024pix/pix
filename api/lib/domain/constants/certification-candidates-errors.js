module.exports.CERTIFICATION_CANDIDATES_ERRORS = {
  CANDIDATE_BILLING_MODE_MUST_BE_A_STRING: {
    code: 'CANDIDATE_BILLING_MODE_MUST_BE_A_STRING',
    getMessage: () => '',
  },
  CANDIDATE_PREPAYMENT_CODE_MUST_BE_EMPTY: {
    code: 'CANDIDATE_PREPAYMENT_CODE_MUST_BE_EMPTY',
    getMessage: () => '',
  },
  CANDIDATE_BILLING_MODE_NOT_VALID: {
    code: 'CANDIDATE_BILLING_MODE_NOT_VALID',
    getMessage: () => '',
  },
  CANDIDATE_BILLING_MODE_REQUIRED: {
    code: 'CANDIDATE_BILLING_MODE_REQUIRED',
    getMessage: () => '',
  },
  CANDIDATE_BILLING_MODE_MUST_BE_EMPTY: {
    code: 'CANDIDATE_BILLING_MODE_MUST_BE_EMPTY',
    getMessage: () => '',
  },
  CANDIDATE_BIRTHDATE_REQUIRED: {
    code: 'CANDIDATE_BIRTHDATE_REQUIRED',
    getMessage: () => '',
  },
  CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID: {
    code: 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID',
    getMessage: () => '',
  },
  CANDIDATE_BIRTHDATE_MUST_BE_GREATER: {
    code: 'CANDIDATE_BIRTHDATE_MUST_BE_GREATER',
    getMessage: () => '',
  },
  CANDIDATE_BIRTH_CITY_REQUIRED: {
    code: 'CANDIDATE_BIRTH_CITY_REQUIRED',
    getMessage: () => 'Le champ ville est obligatoire.',
  },
  CANDIDATE_BIRTH_COUNTRY_NOT_FOUND: {
    code: 'CANDIDATE_BIRTH_COUNTRY_NOT_FOUND',
    getMessage: ({ birthCountry }) => `Le pays "${birthCountry}" n'a pas été trouvé.`,
  },
  CANDIDATE_BIRTH_COUNTRY_REQUIRED: {
    code: 'CANDIDATE_BIRTH_COUNTRY_REQUIRED',
    getMessage: () => 'Le champ pays est obligatoire.',
  },
  CANDIDATE_BIRTH_INSEE_CODE_NOT_VALID: {
    code: 'CANDIDATE_BIRTH_INSEE_CODE_NOT_VALID',
    getMessage: ({ birthINSEECode }) => `Le code INSEE "${birthINSEECode}" n'est pas valide.`,
  },
  CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED: {
    code: 'CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED',
    getMessage: () => 'Renseigner soit un code INSEE soit un code postal et un nom de commune de naissance',
  },
  CANDIDATE_BIRTH_POSTAL_CODE_NOT_FOUND: {
    code: 'CANDIDATE_BIRTH_POSTAL_CODE_NOT_FOUND',
    getMessage: ({ birthPostalCode }) => `Le code postal "${birthPostalCode}" n'est pas valide.`,
  },
  CANDIDATE_BIRTH_POSTAL_CODE_REQUIRED: {
    code: 'CANDIDATE_BIRTH_POSTAL_CODE_REQUIRED',
    getMessage: () => `Le code postal est obligatoire`,
  },
  CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID: {
    code: 'CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID',
    getMessage: ({ birthPostalCode, birthCity }) =>
      `Le code postal "${birthPostalCode}" ne correspond pas à la ville "${birthCity}"`,
  },
  CANDIDATE_EMAIL_NOT_VALID: {
    code: 'CANDIDATE_EMAIL_NOT_VALID',
    getMessage: () => '',
  },
  CANDIDATE_EXTRA_TIME_BELOW_ONE: {
    code: 'CANDIDATE_EXTRA_TIME_BELOW_ONE',
    getMessage: () => `Le temps majoré doit être un pourcentage.`,
  },
  CANDIDATE_EXTRA_TIME_INTEGER: {
    code: 'CANDIDATE_EXTRA_TIME_INTEGER',
    getMessage: () => `Le temps majoré doit être un nombre entier.`,
  },
  CANDIDATE_FIRST_NAME_REQUIRED: {
    code: 'CANDIDATE_FIRST_NAME_REQUIRED',
    getMessage: () => '',
  },
  CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID: {
    code: 'CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID',
    getMessage: () => 'La valeur du code INSEE doit être "99" pour un pays étranger.',
  },
  CANDIDATE_LAST_NAME_REQUIRED: {
    code: 'CANDIDATE_LAST_NAME_REQUIRED',
    getMessage: () => '',
  },
  CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION: {
    code: 'CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION',
    getMessage: () => '',
  },
  CANDIDATE_POSTAL_CODE_ON_FOREIGN_COUNTRY_MUST_BE_EMPTY: {
    code: 'CANDIDATE_POSTAL_CODE_ON_FOREIGN_COUNTRY_MUST_BE_EMPTY',
    getMessage: () => 'Le champ code postal ne doit pas être renseigné pour un pays étranger.',
  },
  CANDIDATE_PREPAYMENT_CODE_REQUIRED: {
    code: 'CANDIDATE_PREPAYMENT_CODE_REQUIRED',
    getMessage: () => '',
  },
  CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID: {
    code: 'CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID',
    getMessage: () => '',
  },
  CANDIDATE_SESSION_ID_REQUIRED: {
    code: 'CANDIDATE_SESSION_ID_REQUIRED',
    getMessage: () => '',
  },
  CANDIDATE_SEX_NOT_VALID: {
    code: 'CANDIDATE_SEX_NOT_VALID',
    getMessage: () => '',
  },
  CANDIDATE_SEX_REQUIRED: {
    code: 'CANDIDATE_SEX_REQUIRED',
    getMessage: () => '',
  },
};
