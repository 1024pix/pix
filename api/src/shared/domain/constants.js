const LEVENSHTEIN_DISTANCE_MAX_RATE = 0.25;

const LOCALE = {
  ENGLISH_SPOKEN: 'en',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_SPOKEN: 'fr',
  DUTCH_SPOKEN: 'nl',
};

const SUPPORTED_LOCALES = ['en', 'fr', 'fr-BE', 'fr-FR'];

const ORGANIZATION_FEATURE = {
  MISSIONS_MANAGEMENT: {
    key: 'MISSIONS_MANAGEMENT',
    description: "Permet l'affichage de la page des missions sur PixOrga",
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

const constants = {
  LEVENSHTEIN_DISTANCE_MAX_RATE,
  ORGANIZATION_FEATURE,
};

export { constants, LEVENSHTEIN_DISTANCE_MAX_RATE, LOCALE, SUPPORTED_LOCALES, ORGANIZATION_FEATURE };
