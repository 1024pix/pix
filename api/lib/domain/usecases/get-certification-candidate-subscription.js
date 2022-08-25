const CertificationCandidateSubscription = require('../read-models/CertificationCandidateSubscription');
const _ = require('lodash');

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
  if (certificationCandidate.complementaryCertifications.length) {
    const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
      userId: certificationCandidate.userId,
    });

    certificationCandidate.complementaryCertifications.map((registeredComplementaryCertification) => {
      const isSubscriptionEligible = certifiableBadgeAcquisitions.some(
        ({ complementaryCertification }) => complementaryCertification.key === registeredComplementaryCertification.key
      );

      if (isSubscriptionEligible) {
        eligibleSubscriptions.push(registeredComplementaryCertification);
      } else {
        nonEligibleSubscriptions.push(registeredComplementaryCertification);
      }
    });
  }

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscriptions,
  });
};
