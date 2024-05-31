import { Subscription } from '../../../../../../src/certification/enrolment/domain/models/Subscription.js';

const buildCoreSubscription = function ({ certificationCandidateId } = {}) {
  return Subscription.buildCore({ certificationCandidateId });
};

const buildComplementarySubscription = function ({ certificationCandidateId, complementaryCertificationId = 1 } = {}) {
  return Subscription.buildComplementary({ certificationCandidateId, complementaryCertificationId });
};

export { buildComplementarySubscription, buildCoreSubscription };
