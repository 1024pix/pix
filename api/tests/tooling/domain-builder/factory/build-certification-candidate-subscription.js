import { CertificationCandidateSubscription } from '../../../../lib/domain/read-models/CertificationCandidateSubscription.js';

const buildCertificationCandidateSubscription = function ({
  id = 1234,
  sessionId = 1234,
  eligibleSubscription = null,
  nonEligibleSubscription = null,
} = {}) {
  return new CertificationCandidateSubscription({
    id,
    sessionId,
    eligibleSubscription,
    nonEligibleSubscription,
  });
};

export { buildCertificationCandidateSubscription };
