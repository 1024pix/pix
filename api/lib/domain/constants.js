const settings = require('../config');

const PIX_COUNT_BY_LEVEL = 8;

module.exports = {
  PIX_COUNT_BY_LEVEL,
  MAX_REACHABLE_LEVEL: settings.features.maxReachableLevel,
  MAX_REACHABLE_PIX_BY_COMPETENCE: settings.features.maxReachableLevel * PIX_COUNT_BY_LEVEL,
  MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION: 3,
  MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS: 4,
  MINIMUM_DELAY_IN_DAYS_FOR_RESET: settings.features.dayBeforeCompetenceResetV2,
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING: settings.features.dayBeforeImproving,
  MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING: settings.features.dayBeforeRetrying,

  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY: 5,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY: 1,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED: 50,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED: 80,
  UNCERTIFIED_LEVEL: -1,

  MAX_LEVEL_TO_BE_AN_EASY_TUBE: 3,
  DEFAULT_LEVEL_FOR_FIRST_CHALLENGE: 2,
  MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL: 2,

  PIX_ORIGIN: 'Pix',

  PIX_ORGA: {
    SCOPE: 'pix-orga',
    NOT_LINKED_ORGANIZATION_MSG: 'L\'accès à Pix Orga est limité aux membres invités. Chaque espace est géré par un administrateur Pix Orga propre à l\'organisation qui l\'utilise. Contactez-le pour qu\'il vous y invite.',
  },
  PIX_ADMIN: {
    SCOPE: 'pix-admin',
    NOT_PIXMASTER_MSG: 'Vous n\'avez pas les droits pour vous connecter.',
  },
  PIX_CERTIF: {
    SCOPE: 'pix-certif',
    NOT_LINKED_CERTIFICATION_MSG: 'L\'accès à Pix Certif est limité aux centres de certification Pix. Contactez le référent de votre centre de certification si vous pensez avoir besoin d\'y accéder.',
  },
  LOCALE: {
    ENGLISH_SPOKEN: 'en',
    FRENCH_FRANCE: 'fr-fr',
    FRENCH_SPOKEN: 'fr',
  },
  STUDENT_RECONCILIATION_ERRORS: {
    RECONCILIATION: {
      IN_OTHER_ORGANIZATION: {
        email: { shortCode: 'R11', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
        username: { shortCode: 'R12', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
        samlId: { shortCode: 'R13', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
      },
      IN_SAME_ORGANIZATION: {
        email: { shortCode: 'R31', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
        username: { shortCode: 'R32', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
        samlId: { shortCode: 'R33', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
        anotherStudentIsAlreadyReconciled: { shortCode: 'R70', code: 'USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION' },

      },
    },
    LOGIN_OR_REGISTER: {
      IN_SAME_ORGANIZATION: {
        email: { shortCode: 'S51', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
        username: { shortCode: 'S52', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
        samlId: { shortCode: 'S53', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
      },
      IN_OTHER_ORGANIZATION: {
        email: { shortCode: 'S61', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
        username: { shortCode: 'S62', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
        samlId: { shortCode: 'S63', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
      },
    },
  },
};
