import { CertificationCandidateSubscription } from '../read-models/CertificationCandidateSubscription.js';

const getCertificationCandidateSubscription = async function ({
  certificationCandidateId,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationCenterRepository,
}) {
  const certificationCandidate = await certificationCandidateRepository.getWithComplementaryCertification(
    certificationCandidateId
  );

  if (!certificationCandidate.complementaryCertification) {
    return new CertificationCandidateSubscription({
      id: certificationCandidateId,
      sessionId: certificationCandidate.sessionId,
      eligibleSubscriptions: [],
      nonEligibleSubscriptions: [],
    });
  }

  const certificationCenter = await certificationCenterRepository.getBySessionId(certificationCandidate.sessionId);

  const eligibleSubscriptions = [];
  const nonEligibleSubscriptions = [];
  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
  });

  if (certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
    const isSubscriptionEligible = certifiableBadgeAcquisitions.some(
      ({ complementaryCertificationKey }) =>
        complementaryCertificationKey === certificationCandidate.complementaryCertification.key
    );

    if (isSubscriptionEligible) {
      eligibleSubscriptions.push(certificationCandidate.complementaryCertification);
    } else {
      nonEligibleSubscriptions.push(certificationCandidate.complementaryCertification);
    }
  }

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscriptions,
  });
};

export { getCertificationCandidateSubscription };
