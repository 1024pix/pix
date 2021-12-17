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
  }

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscriptions,
  });
};
