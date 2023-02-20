import CertificationCandidateSubscription from '../read-models/CertificationCandidateSubscription';
import _ from 'lodash';

export default async function getCertificationCandidateSubscription({
  certificationCandidateId,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationCenterRepository,
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

  const certificationCenter = await certificationCenterRepository.getBySessionId(certificationCandidate.sessionId);

  const eligibleSubscriptions = [];
  const nonEligibleSubscriptions = [];
  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
  });

  certificationCandidate.complementaryCertifications.forEach((registeredComplementaryCertification) => {
    if (!certificationCenter.isHabilitated(registeredComplementaryCertification.key)) {
      return;
    }
    const isSubscriptionEligible = certifiableBadgeAcquisitions.some(
      ({ complementaryCertificationKey }) => complementaryCertificationKey === registeredComplementaryCertification.key
    );

    if (isSubscriptionEligible) {
      eligibleSubscriptions.push(registeredComplementaryCertification);
    } else {
      nonEligibleSubscriptions.push(registeredComplementaryCertification);
    }
  });

  return new CertificationCandidateSubscription({
    id: certificationCandidateId,
    sessionId: certificationCandidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscriptions,
  });
}
