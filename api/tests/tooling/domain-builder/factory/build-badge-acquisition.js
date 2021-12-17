const buildBadge = require('./build-badge');
const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE,
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

buildBadgeAcquisition.forPixEduFormationContinue1erDegreExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT }) });
};

buildBadgeAcquisition.forPixEduFormationContinue1erDegreMaitre = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE }) });
};

buildBadgeAcquisition.forPixEduFormationContinue1erDegreInitie = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE }) });
};

buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER }) });
};

buildBadgeAcquisition.forPixDroitMaitre = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_MAITRE_CERTIF }) });
};

buildBadgeAcquisition.forPixDroitExpert = function () {
  return buildBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_EXPERT_CERTIF }) });
};

module.exports = buildBadgeAcquisition;
