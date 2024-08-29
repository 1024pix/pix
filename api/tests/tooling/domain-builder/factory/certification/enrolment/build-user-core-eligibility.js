import { UserCoreEligibility } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';

const buildUserCoreEligibility = function ({ isCertifiable = true } = {}) {
  return new UserCoreEligibility({ isCertifiable });
};

export { buildUserCoreEligibility };
