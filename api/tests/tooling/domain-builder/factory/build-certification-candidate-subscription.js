import CertificationCandidateSubscription from '../../../../lib/domain/read-models/CertificationCandidateSubscription';

export default function buildCertificationCandidateSubscription({
  id = 1234,
  sessionId = 1234,
  eligibleSubscriptions = [],
  nonEligibleSubscriptions = [],
} = {}) {
  return new CertificationCandidateSubscription({
    id,
    sessionId,
    eligibleSubscriptions,
    nonEligibleSubscriptions,
  });
}
