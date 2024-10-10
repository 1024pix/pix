import { CertificationCandidateSubscription } from '../../../../src/certification/enrolment/domain/read-models/CertificationCandidateSubscription.js';

const buildCertificationCandidateSubscription = function ({
  id = 1234,
  sessionId = 1234,
  eligibleSubscriptions = [],
  nonEligibleSubscription = null,
  sessionVersion = 2,
} = {}) {
  return new CertificationCandidateSubscription({
    id,
    sessionId,
    eligibleSubscriptions,
    nonEligibleSubscription,
    sessionVersion,
  });
};

export { buildCertificationCandidateSubscription };
