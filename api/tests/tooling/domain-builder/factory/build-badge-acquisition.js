const buildBadge = require('./build-badge');
const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

const buildBadgeAcquisition = function buildBadgeAcquisition({
  id = 123,
  userId = 456,
  badgeId = 789,
  campaignParticipationId = 159,
  badge,
} = {}) {
  badge = badge || buildBadge({ id: badgeId });
  return new BadgeAcquisition({
    id,
    userId,
    badgeId,
    campaignParticipationId,
    badge,
  });
};

buildBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT }) });
};

buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE }) });
};

buildBadgeAcquisition.forPixEduFormationContinue2ndDegreConfirme = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreConfirme = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreInitie = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE }) });
};

buildBadgeAcquisition.forPixEduFormationContinue1erDegreExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT }) });
};

buildBadgeAcquisition.forPixEduFormationContinue1erDegreAvance = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE }) });
};

buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE }) });
};

buildBadgeAcquisition.forPixDroitMaitre = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_MAITRE_CERTIF }) });
};

buildBadgeAcquisition.forPixDroitExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_EXPERT_CERTIF }) });
};

module.exports = buildBadgeAcquisition;
