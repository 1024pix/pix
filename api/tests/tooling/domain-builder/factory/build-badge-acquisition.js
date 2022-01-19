const buildBadge = require('./build-badge');
const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
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

buildBadgeAcquisition.forPixEduFormationContinue2ndDegreFormateur = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR }) });
};

buildBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT }) });
};

buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE }) });
};

buildBadgeAcquisition.forPixDroitMaitre = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_MAITRE_CERTIF }) });
};

buildBadgeAcquisition.forPixDroitExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_EXPERT_CERTIF }) });
};

module.exports = buildBadgeAcquisition;
