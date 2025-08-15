import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import * as injectedCertificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as injectedCertificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as injectedCenterRepository from '../../infrastructure/repositories/center-repository.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
import { CertificationCandidateSubscription } from '../read-models/CertificationCandidateSubscription.js';

const getCertificationCandidateSubscription = async function ({
  certificationCandidateId,
  certificationBadgesService = injectedCertificationBadgesService,
  certificationCandidateRepository = injectedCertificationCandidateRepository,
  centerRepository = injectedCenterRepository,
  sessionRepository = injectedSessionRepository,
} = {}) {
  const certificationCandidate = await certificationCandidateRepository.getWithComplementaryCertification({
    id: certificationCandidateId,
  });

  const session = await sessionRepository.get({ id: certificationCandidate.sessionId });

  if (!certificationCandidate.isEnrolledToDoubleCertification()) {
    return _emptyCertificationCandidateSubscription(certificationCandidate, session);
  }

  const center = await centerRepository.getById({
    id: session.certificationCenterId,
  });

  if (!center.isHabilitated(certificationCandidate.complementaryCertification.key)) {
    return _emptyCertificationCandidateSubscription(certificationCandidate, session);
  }

  const certifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId: certificationCandidate.userId,
    limitDate: certificationCandidate.reconciledAt,
  });

  const [doubleCertificationCertifiableBadgeAcquisition] = certifiableBadgeAcquisitions.filter(
    (certifiableBadgeAcquisition) =>
      certifiableBadgeAcquisition.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA,
  );

  if (!doubleCertificationCertifiableBadgeAcquisition) {
    return _uneligibleCertificationCandidateSubscription(certificationCandidate, session);
  }

  return _eligibleCertificationCandidateSubscriptions(certificationCandidate, session);
};

function _emptyCertificationCandidateSubscription(candidate, session) {
  return new CertificationCandidateSubscription({
    id: candidate.id,
    sessionId: candidate.sessionId,
    eligibleSubscriptions: [],
    nonEligibleSubscription: null,
    sessionVersion: session.version,
  });
}

function _uneligibleCertificationCandidateSubscription(candidate, session) {
  return new CertificationCandidateSubscription({
    id: candidate.id,
    sessionId: candidate.sessionId,
    eligibleSubscriptions: [],
    nonEligibleSubscription: {
      label: candidate.complementaryCertification.label,
      type: 'COMPLEMENTARY',
    },
    sessionVersion: session.version,
  });
}

function _eligibleCertificationCandidateSubscriptions(candidate, session) {
  const eligibleSubscriptions = candidate.subscriptions.map((subscription) => {
    return {
      label: subscription.type === 'COMPLEMENTARY' ? candidate.complementaryCertification.label : null,
      type: subscription.type,
    };
  });

  return new CertificationCandidateSubscription({
    id: candidate.id,
    sessionId: candidate.sessionId,
    eligibleSubscriptions,
    nonEligibleSubscription: null,
    sessionVersion: session.version,
  });
}

export { getCertificationCandidateSubscription };
