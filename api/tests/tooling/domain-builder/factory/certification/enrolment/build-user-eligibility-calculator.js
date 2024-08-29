import { UserEligibilityCalculator } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';

const buildUserEligibilityCalculator = function ({
  userId = 123,
  date = new Date('1990-01-04'),
  eligibilities = [],
  eligibilitiesV2 = [],
} = {}) {
  return new UserEligibilityCalculator({
    userId,
    date,
    eligibilities,
    eligibilitiesV2,
  });
};

export { buildUserEligibilityCalculator };
