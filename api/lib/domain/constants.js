const settings = require('../config');

module.exports = {
  MAX_REACHABLE_LEVEL: 5,
  MAX_REACHABLE_PIX_BY_COMPETENCE: 40,
  PIX_COUNT_BY_LEVEL: 8,
  MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION: 3,
  MINIMUM_DELAY_IN_DAYS_FOR_RESET: settings.features.dayBeforeCompetenceResetV2,
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING: settings.features.dayBeforeImproving,

  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY: 5,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY: 1,
  MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED: 50,
  MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED: 80,
  UNCERTIFIED_LEVEL: -1,

  MAX_LEVEL_TO_BE_AN_EASY_TUBE: 3,
  DEFAULT_LEVEL_FOR_FIRST_CHALLENGE: 2,
  MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL: 2,

  PIX_ORGA: {
    SCOPE: 'pix-orga',
    NOT_LINKED_ORGANIZATION_MSG: 'Vous ne pouvez pas vous connecter à PixOrga car vous n’êtes rattaché à aucune organisation. Contactez votre administrateur qui pourra vous inviter.'
  },
  PIX_ADMIN: {
    SCOPE: 'pix-admin',
    NOT_PIXMASTER_MSG: 'Vous ne pouvez pas vous connecter à pix-admin car vous n’avez pas le rôle PixMaster.'
  },
  PIX_CERTIF: {
    SCOPE: 'pix-certif',
    NOT_LINKED_CERTIFICATION_MSG: 'L\'accès à Pix Certif est limité aux centres de certification Pix. Contactez le référent de votre centre de certification si vous pensez avoir besoin d\'y accéder.'
  },
};
