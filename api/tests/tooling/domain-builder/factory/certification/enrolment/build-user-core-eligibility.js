import { UserCoreEligibility } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';

const buildUserCoreEligibility = function ({ isCertifiable = true, isV2 = false } = {}) {
  return new UserCoreEligibility({ isCertifiable, isV2 });
};

export { buildUserCoreEligibility };
