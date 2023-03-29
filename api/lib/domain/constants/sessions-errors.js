module.exports.CERTIFICATION_SESSIONS_ERRORS = {
  INFORMATION_NOT_ALLOWED_WITH_SESSION_ID: {
    code: 'INFORMATION_NOT_ALLOWED_WITH_SESSION_ID',
    getMessage: () => `Merci de ne pas renseigner les informations de session`,
  },
  CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION: {
    code: 'CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION',
    getMessage: () => `Impossible d'ajouter un candidat à une session qui a déjà commencé.`,
  },
  SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS: {
    code: 'SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS',
    getMessage: ({ session }) => `Session happening on ${session.date} at ${session.time} already exists`,
  },
  SESSION_SCHEDULED_IN_THE_PAST: {
    code: 'SESSION_SCHEDULED_IN_THE_PAST',
    getMessage: () => `Une session ne peut pas être programmée dans le passé`,
  },
  SESSION_ID_NOT_VALID: {
    code: 'SESSION_ID_NOT_VALID',
    getMessage: () => '',
  },
  DUPLICATE_CANDIDATE_NOT_ALLOWED_IN_SESSION: {
    code: 'DUPLICATE_CANDIDATE_NOT_ALLOWED_IN_SESSION',
    getMessage: () => `Une session contient au moins un élève en double.`,
  },
  SESSION_ADDRESS_REQUIRED: {
    code: 'SESSION_ADDRESS_REQUIRED',
    getMessage: () => 'Veuillez indiquer un nom de site.',
  },
  SESSION_ROOM_REQUIRED: {
    code: 'SESSION_ROOM_REQUIRED',
    getMessage: () => 'Veuillez indiquer un nom de salle.',
  },
  SESSION_DATE_REQUIRED: {
    code: 'SESSION_DATE_REQUIRED',
    getMessage: () => 'Veuillez indiquer une date de début.',
  },
  SESSION_DATE_NOT_VALID: {
    code: 'SESSION_DATE_NOT_VALID',
    getMessage: () => 'Veuillez indiquer une date de début valide.',
  },
  SESSION_TIME_REQUIRED: {
    code: 'SESSION_TIME_REQUIRED',
    getMessage: () => 'Veuillez indiquer une heure de début.',
  },
  SESSION_TIME_NOT_VALID: {
    code: 'SESSION_TIME_NOT_VALID',
    getMessage: () => 'Veuillez indiquer une heure de début valide.',
  },
  SESSION_EXAMINER_REQUIRED: {
    code: 'SESSION_EXAMINER_REQUIRED',
    getMessage: () => 'Veuillez indiquer un(e) surveillant(e).',
  },
  EMPTY_SESSION: {
    code: 'EMPTY_SESSION',
    getMessage: () => '',
  },
};
