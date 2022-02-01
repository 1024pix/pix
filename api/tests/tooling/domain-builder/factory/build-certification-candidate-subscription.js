const CertificationCandidateSubscription = require('../../../../lib/domain/read-models/CertificationCandidateSubscription');

module.exports = function buildCertificationCandidateSubscription({
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
};
