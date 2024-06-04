import { CertificationCandidateSubscription } from '../read-models/CertificationCandidateSubscription.js';

const getCertificationCandidateSubscription = async function ({
  certificationCandidateId,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationCenterRepository,
  sessionRepository,
}) {
  const certificationCandidate =
    await certificationCandidateRepository.getWithComplementaryCertification(certificationCandidateId);

  const sessionVersion = await sessionRepository.getVersion({ id: certificationCandidate.sessionId });

  if (!certificationCandidate.complementaryCertification) {
    return new CertificationCandidateSubscription({
      id: certificationCandidateId,
      sessionId: certificationCandidate.sessionId,
      eligibleSubscription: null,
      nonEligibleSubscription: null,
      sessionVersion,
    });
  }

  const certificationCenter = await certificationCenterRepository.getBySessionId({
    sessionId: certificationCandidate.sessionId,
  });

  let eligibleSubscription = null;
  let nonEligibleSubscription = null;
  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
  });

  if (certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
    const isSubscriptionEligible = certifiableBadgeAcquisitions.some(
      ({ complementaryCertificationKey }) =>
        complementaryCertificationKey === certificationCandidate.complementaryCertification.key,
    );

    if (isSubscriptionEligible) {
      eligibleSubscription = certificationCandidate.complementaryCertification;
    } else {
      nonEligibleSubscription = certificationCandidate.complementaryCertification;
    }
  }

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscription,
    nonEligibleSubscription,
    sessionVersion,
  });
};

export { getCertificationCandidateSubscription };
