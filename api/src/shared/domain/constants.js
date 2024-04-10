const LEVENSHTEIN_DISTANCE_MAX_RATE = 0.25;

const LOCALE = {
  ENGLISH_SPOKEN: 'en',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_SPOKEN: 'fr',
  DUTCH_SPOKEN: 'nl',
};

const SUPPORTED_LOCALES = ['en', 'fr', 'fr-BE', 'fr-FR', 'nl-BE'];

const ORGANIZATION_FEATURE = {
  MISSIONS_MANAGEMENT: {
    key: 'MISSIONS_MANAGEMENT',
    description: "Permet l'affichage de la page des missions sur PixOrga",
  },
  LEARNER_IMPORT: {
    key: 'LEARNER_IMPORT',
    description: "Permet l'import de participants sur PixOrga",
  },
  PLACES_MANAGEMENT: {
    key: 'PLACES_MANAGEMENT',
    description: "Permet l'affichage de la page de gestion des places sur PixOrga",
  },
  MULTIPLE_SENDING_ASSESSMENT: {
    key: 'MULTIPLE_SENDING_ASSESSMENT',
    description: "Permet d'activer l'envoi multiple sur les campagnes d'évaluation",
  },
  COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: {
    key: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
    description: "Permet d'activer la remontée automatique de la certificabilité des prescrits",
  },
};

const VALIDATION_ERRORS = {
  UNICITY_COLUMNS_REQUIRED: 'UNICITY_COLUMNS_REQUIRED',
  PROPERTY_NOT_UNIQ: 'PROPERTY_NOT_UNIQ',
  FIELD_DATE_FORMAT: 'FIELD_DATE_FORMAT',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  FIELD_NOT_STRING: 'FIELD_NOT_STRING',
  FIELD_STRING_MIN: 'FIELD_STRING_MIN',
  FIELD_STRING_MAX: 'FIELD_STRING_MAX',
};

export { LEVENSHTEIN_DISTANCE_MAX_RATE, LOCALE, ORGANIZATION_FEATURE, SUPPORTED_LOCALES, VALIDATION_ERRORS };
