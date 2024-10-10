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
      eligibleSubscriptions: [],
      nonEligibleSubscription: null,
      sessionVersion: session.version,
    });
  }

  const center = await centerRepository.getById({
    id: session.certificationCenterId,
  });

  let eligibleSubscriptions = [];
  let nonEligibleSubscription = null;
  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
    limitDate: certificationCandidate.reconciledAt,
  });

  if (center.isHabilitated(certificationCandidate.complementaryCertification.key)) {
    const isSubscriptionEligible = certifiableBadgeAcquisitions.some(
      ({ complementaryCertificationKey }) =>
        complementaryCertificationKey === certificationCandidate.complementaryCertification.key,
    );

    if (isSubscriptionEligible) {
      eligibleSubscriptions = certificationCandidate.subscriptions.map((subscription) => {
        return {
          label: subscription.type === 'COMPLEMENTARY' ? certificationCandidate.complementaryCertification.label : null,
          type: subscription.type,
        };
      });
    } else {
      nonEligibleSubscription = certificationCandidate.complementaryCertification;
    }
  }

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscription,
    sessionVersion: session.version,
  });
};

export { getCertificationCandidateSubscription };
