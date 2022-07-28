const CertificationCandidateSubscription = require('../read-models/CertificationCandidateSubscription');
const Badge = require('../models/Badge');
const _ = require('lodash');

function _hasStillValidPixPlusDroit(badgeAcquisitions) {
  return badgeAcquisitions.some(
    (badgeAcquisition) =>
      badgeAcquisition.badgeKey === Badge.keys.PIX_DROIT_MAITRE_CERTIF ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_DROIT_EXPERT_CERTIF
  );
}

function _hasStillValidPixPlusEdu1erDegre(badgeAcquisitions) {
  return badgeAcquisitions.some(
    (badgeAcquisition) =>
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT
  );
}

function _hasStillValidPixPlusEdu2ndDegre(badgeAcquisitions) {
  return badgeAcquisitions.some(
    (badgeAcquisition) =>
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME ||
      badgeAcquisition.badgeKey === Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
  );
}

module.exports = async function getCertificationCandidateSubscription({
  certificationCandidateId,
  certificationBadgesService,
  certificationCandidateRepository,
}) {
  const certificationCandidate = await certificationCandidateRepository.getWithComplementaryCertifications(
    certificationCandidateId
  );

  if (_.isEmpty(certificationCandidate.complementaryCertifications)) {
    return new CertificationCandidateSubscription({
      id: certificationCandidateId,
      sessionId: certificationCandidate.sessionId,
      eligibleSubscriptions: [],
      nonEligibleSubscriptions: [],
    });
  }

  const eligibleSubscriptions = [];
  const nonEligibleSubscriptions = [];
  for (const complementaryCertification of certificationCandidate.complementaryCertifications) {
    if (complementaryCertification.isPixPlusDroit()) {
      const stillValidCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: certificationCandidate.userId,
      });
      if (_hasStillValidPixPlusDroit(stillValidCertifiableBadgeAcquisitions)) {
        eligibleSubscriptions.push(complementaryCertification);
      } else {
        nonEligibleSubscriptions.push(complementaryCertification);
      }
    }
    if (complementaryCertification.isClea()) {
      const hasStillValidCleaBadge = await certificationBadgesService.hasStillValidCleaBadgeAcquisition({
        userId: certificationCandidate.userId,
      });
      if (hasStillValidCleaBadge) {
        eligibleSubscriptions.push(complementaryCertification);
      } else {
        nonEligibleSubscriptions.push(complementaryCertification);
      }
    }
    if (complementaryCertification.isPixPlusEdu1erDegre()) {
      const stillValidCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: certificationCandidate.userId,
      });
      if (_hasStillValidPixPlusEdu1erDegre(stillValidCertifiableBadgeAcquisitions)) {
        eligibleSubscriptions.push(complementaryCertification);
      } else {
        nonEligibleSubscriptions.push(complementaryCertification);
      }
    }
    if (complementaryCertification.isPixPlusEdu2ndDegre()) {
      const stillValidCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: certificationCandidate.userId,
      });
      if (_hasStillValidPixPlusEdu2ndDegre(stillValidCertifiableBadgeAcquisitions)) {
        eligibleSubscriptions.push(complementaryCertification);
      } else {
        nonEligibleSubscriptions.push(complementaryCertification);
      }
    }
  }

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscriptions,
  });
};
