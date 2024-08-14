import { CertificationCandidateSubscription } from '../read-models/CertificationCandidateSubscription.js';

const getCertificationCandidateSubscription = async function ({
  certificationCandidateId,
  certificationBadgesService,
  certificationCandidateRepository,
  centerRepository,
  sessionRepository,
}) {
  const certificationCandidate = await certificationCandidateRepository.getWithComplementaryCertification({
    id: certificationCandidateId,
  });

  const session = await sessionRepository.get({ id: certificationCandidate.sessionId });

  if (!certificationCandidate.complementaryCertification) {
    return new CertificationCandidateSubscription({
      id: certificationCandidateId,
      sessionId: certificationCandidate.sessionId,
      eligibleSubscription: null,
      nonEligibleSubscription: null,
      sessionVersion: session.version,
    });
  }

  const center = await centerRepository.getById({
    id: session.certificationCenterId,
  });

  let eligibleSubscription = null;
  let nonEligibleSubscription = null;
  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
  });

  if (center.isHabilitated(certificationCandidate.complementaryCertification.key)) {
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
    sessionVersion: session.version,
  });
};

export { getCertificationCandidateSubscription };
