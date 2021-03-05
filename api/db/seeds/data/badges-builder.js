const PIX_EMPLOI_CLEA_BADGE_ID = 100;
const BASICS_BADGE_ID = 111;
const TOOLS_BADGE_ID = 112;
const MANIP_BADGE_ID = 113;
const PRO_BASICS_BADGE_ID = 114;
const PRO_TOOLS_BADGE_ID = 115;
const PIX_DROIT_BADGE_ID = 116;
const PIX_DROIT_BADGE_PARTNER_COMPETENCE_1 = '78954665';
const PIX_DROIT_BADGE_PARTNER_COMPETENCE_2 = '13654984';
const PIX_DROIT_BADGE_PARTNER_COMPETENCE_3 = '14089753';
const PIX_DROIT_BADGE_PARTNER_COMPETENCE_4 = '09873856';
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const Badge = require('../../../lib/domain/models/Badge');
const {
  skillIdsForBadgePartnerCompetences,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_DROIT_ID,
} = require('./target-profiles-builder');

function badgesBuilder({ databaseBuilder }) {
  _createPixEmploiCleaBadge(databaseBuilder);
  _createBasicsBadge(databaseBuilder);
  _createToolsBadge(databaseBuilder);
  _createManipBadge(databaseBuilder);
  _createProfessionalBasicsBadge(databaseBuilder);
  _createProfessionalToolsBadge(databaseBuilder);
  _createPixDroitBadge(databaseBuilder);
}

function _createPixEmploiCleaBadge(databaseBuilder) {
  const badge = databaseBuilder.factory.buildBadge({
    id: PIX_EMPLOI_CLEA_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix Emploi.',
    title: 'Pix Emploi - Clea',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/Pix-emploi.svg',
    key: Badge.keys.PIX_EMPLOI_CLEA,
    message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
      'Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  });

  _associateBadgePartnerCompetences(databaseBuilder, skillIdsForBadgePartnerCompetences, badge);
  _associateBadgeCriteria(databaseBuilder, badge);
}

function _createBasicsBadge(databaseBuilder) {
  const targetProfileSkillIdsForBasicsBadge = [
    ['rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp'],
    ['recMOy4S8XnaWblYI', 'recagUd44RPEWti0X'],
    ['recrvTvLTUXEcUIV1', 'recX7RyCsdNV2p168'],
    ['recxtb5aLs6OAAKIg', 'receRbbt9Lb661wFB'],
  ];

  const basicsBadge = databaseBuilder.factory.buildBadge({
    id: BASICS_BADGE_ID,
    altMessage: 'Vous avez validé les bases.',
    title: 'Des bases sont là',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'Basics',
    message: 'Bravo ! Vous maîtrisez quelques bases du numérique comme le vocabulaire, la manipulation basique ou l\'utilisation d\'outils',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForBasicsBadge, basicsBadge);
  _associateBadgeCriteria(databaseBuilder, basicsBadge);
}

function _createToolsBadge(databaseBuilder) {
  const targetProfileSkillIdsForToolsBadge = [
    ['rec71e3PSct2zLEMj', 'recFwJlpllhWzuLom'],
    ['rec0J9OXaAj5v7w3r', 'reclY3njuk6EySJuU'],
    ['rec5V9gp65a58nnco', 'recPrXhP0X07OdHXe'],
    ['recPG9ftlGZLiF0O6', 'rectLj7NPg5JcSIqN'],
  ];

  const toolsBadge = databaseBuilder.factory.buildBadge({
    id: TOOLS_BADGE_ID,
    altMessage: 'Vous avez validé le Vocabulaire et outils du numérique.',
    title: 'Vocabulaire et outils du numérique',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/pro-recherche.svg',
    key: 'Tools',
    message: 'Vous reconnaissez les éléments courants du numérique: le matériel, la messagerie, un document et un navigateur WEB.',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForToolsBadge, toolsBadge);
  _associateBadgeCriteria(databaseBuilder, toolsBadge);
}

function _createManipBadge(databaseBuilder) {
  const targetProfileSkillIdsForManipBadge = [
    ['rec9qal2FLjWysrfu', 'rechRPFlSryfY3UnG'],
    ['recL0AotZshb9quhR', 'recrOwaV2PTt1N0i5'],
    ['recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx'],
    ['recTIddrkopID28Ep', 'recBrDIfDDW2IPpZV'],
  ];

  const manipBadge = databaseBuilder.factory.buildBadge({
    id: MANIP_BADGE_ID,
    altMessage: 'Vous avez validé la manipulation.',
    title: 'Je manipule',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/office.svg',
    key: 'Manip',
    message: 'Vous maîtrisez les gestes de base : le clic, la saisie de texte et la navigation entre onglets d\'un navigateur WEB',
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
  });

  _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForManipBadge, manipBadge);
  _associateBadgeCriteria(databaseBuilder, manipBadge);
}

function _createProfessionalBasicsBadge(databaseBuilder) {
  const basicsBadge = databaseBuilder.factory.buildBadge({
    id: PRO_BASICS_BADGE_ID,
    altMessage: 'Vous avez validé les bases professionnelles.',
    title: 'Bases professionnelles',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'Pro Basics',
    message: 'Bravo ! Vous maîtrisez quelques bases  du numérique pour le monde professionnel !',
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
  });

  _associateBadgeCriteria(databaseBuilder, basicsBadge);
}

function _createProfessionalToolsBadge(databaseBuilder) {
  const toolsBadge = databaseBuilder.factory.buildBadge({
    id: PRO_TOOLS_BADGE_ID,
    altMessage: 'Vous avez validé le Vocabulaire et outils professionels du numérique.',
    title: 'Vocabulaire et outils professionels du numérique',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/pro-recherche.svg',
    key: 'Pro Tools',
    message: 'Vous reconnaissez les éléments courants professionels du numérique: le matériel, la messagerie, un document et un navigateur WEB.',
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
  });

  _associateBadgeCriteria(databaseBuilder, toolsBadge);
}

function _createPixDroitBadge(databaseBuilder) {
  const skillIdsForPix = [
    'recMOy4S8XnaWblYI', 'recPG9ftlGZLiF0O6', 'recH1pcEWLBUCqXTm', 'recIDXphXbneOrbux', 'recclxUSbi0fvIWpd',
    'recLCYATl7TGrkZLh', 'rectL2ZZeWPc7yezp', 'recndXqXiv4pv2Ukp', 'recVv1eoSLW7yFgXv', 'recVywppdS4hGEekR',
  ];

  const skillIdsForPixDroitDomain1 = [
    'recZnnTU4WUP6KwwX', 'rececWx6MmPhufxXk', 'recAFoEonOOChXe9t', 'recaMBgjv3EZnAlWO', 'recXDYAkqqIDCDePc',
    'recwOLZ8bzMQK9NF9', 'recR1SlS7sWoquhoC', 'recPGDVdX0LSOWQQC', 'rec0tk8dZWOzSQbaQ', 'recmoanUlDOyXexPF',
  ];

  const skillIdsForPixDroitDomain2 = [
    'recKbNbM8G7mKaloD', 'recEdU3ZJrHxWOLcb', 'recfktfO0ROu1OifX', 'rec7WOXWi5ClE8BxH', 'recHo6D1spbDR9C2N',
    'recpdpemRXuzV9r10', 'recWXtN5cNP1JQUVx', 'rec7EvARki1b9t574', 'rec6IWrDOSaoX4aLn', 'recI4zS51by3N7Ryi',
  ];

  const skillIdsForPixDroit = skillIdsForPixDroitDomain1.concat(skillIdsForPixDroitDomain2);

  const targetProfileSkillIdsForPixDroitBadge = [
    skillIdsForPix,
    skillIdsForPixDroit,
    skillIdsForPixDroitDomain1,
    skillIdsForPixDroitDomain2,
  ];

  const pixDroitBadge = databaseBuilder.factory.buildBadge({
    id: PIX_DROIT_BADGE_ID,
    altMessage: 'Vous avez validé le badge Pix+ Droit',
    title: 'Pix+ Droit',
    imageUrl: 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/badges/socle-de-base.svg',
    key: 'Droit',
    message: 'Bravo !',
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
  });

  _associatePixDroitBadgePartnerCompetences(databaseBuilder, targetProfileSkillIdsForPixDroitBadge, pixDroitBadge);
  _associatePixDroitBadgeCriteria(databaseBuilder, pixDroitBadge);
}

function _associateBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge) {
  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Rechercher des informations sur internet',
    color: null,
    skillIds: targetProfileSkillIds[0].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Utiliser des outils informatiques',
    color: null,
    skillIds: targetProfileSkillIds[1].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Naviguer sur internet',
    color: null,
    skillIds: targetProfileSkillIds[2].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    name: 'Partager sur les réseaux sociaux',
    color: null,
    skillIds: targetProfileSkillIds[3].map((id) => id),
    badgeId: badge.id,
  });
}

function _associateBadgeCriteria(databaseBuilder, badge) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 85,
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
    threshold: 75,
    badgeId: badge.id,
  });
}

function _associatePixDroitBadgePartnerCompetences(databaseBuilder, targetProfileSkillIds, badge) {
  databaseBuilder.factory.buildBadgePartnerCompetence({
    id: PIX_DROIT_BADGE_PARTNER_COMPETENCE_1,
    name: 'Acquis du référentiel Pix',
    color: null,
    skillIds: targetProfileSkillIds[0].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    id: PIX_DROIT_BADGE_PARTNER_COMPETENCE_2,
    name: 'Acquis Pix+ Droit',
    color: null,
    skillIds: targetProfileSkillIds[1].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    id: PIX_DROIT_BADGE_PARTNER_COMPETENCE_3,
    name: 'Domaine Pix+ Droit #1',
    color: null,
    skillIds: targetProfileSkillIds[2].map((id) => id),
    badgeId: badge.id,
  });

  databaseBuilder.factory.buildBadgePartnerCompetence({
    id: PIX_DROIT_BADGE_PARTNER_COMPETENCE_4,
    name: 'Domaine Pix+ Droit #2',
    color: null,
    skillIds: targetProfileSkillIds[3].map((id) => id),
    badgeId: badge.id,
  });
}

function _associatePixDroitBadgeCriteria(databaseBuilder, badge) {
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 70,
    badgeId: badge.id,
    partnerCompetenceIds: [PIX_DROIT_BADGE_PARTNER_COMPETENCE_1],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 60,
    badgeId: badge.id,
    partnerCompetenceIds: [PIX_DROIT_BADGE_PARTNER_COMPETENCE_2],
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
    threshold: 40,
    badgeId: badge.id,
    partnerCompetenceIds: [PIX_DROIT_BADGE_PARTNER_COMPETENCE_3, PIX_DROIT_BADGE_PARTNER_COMPETENCE_4],
  });
}

module.exports = {
  badgesBuilder,
  PIX_EMPLOI_CLEA_BADGE_ID,
  BASICS_BADGE_ID,
  TOOLS_BADGE_ID,
  MANIP_BADGE_ID,
  PRO_BASICS_BADGE_ID,
  PRO_TOOLS_BADGE_ID,
  PIX_DROIT_BADGE_ID,
};
