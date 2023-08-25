import { CertificationCandidateSubscription } from '../read-models/CertificationCandidateSubscription.js';

const getCertificationCandidateSubscription = async function ({
  certificationCandidateId,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationCenterRepository,
  complementaryCertificationBadgeRepository,
}) {
  const certificationCandidate =
    await certificationCandidateRepository.getWithComplementaryCertification(certificationCandidateId);

  if (!certificationCandidate.complementaryCertification) {
    return new CertificationCandidateSubscription({
      id: certificationCandidateId,
      sessionId: certificationCandidate.sessionId,
      eligibleSubscription: null,
      nonEligibleSubscription: null,
    });
  }

  const certificationCenter = await certificationCenterRepository.getBySessionId(certificationCandidate.sessionId);

  let eligibleSubscription = null;
  let nonEligibleSubscription = null;
  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
  });

  const complementaryCertificationBadges =
    await complementaryCertificationBadgeRepository.findAllByComplementaryCertificationId(
      certificationCandidate.complementaryCertification.id,
    );

  if (certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
    const isSubscriptionEligible =
      certifiableBadgeAcquisitions.some(
        ({ complementaryCertificationKey }) =>
          complementaryCertificationKey === certificationCandidate.complementaryCertification.key,
      ) && complementaryCertificationBadges.some((ccBadge) => !ccBadge.isOutdated());

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
  });
};

export { getCertificationCandidateSubscription };
