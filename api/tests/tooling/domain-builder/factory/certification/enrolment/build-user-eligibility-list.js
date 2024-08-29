import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';

const buildUserEligibilityList = function ({
  userId = 123,
  date = new Date('1990-01-04'),
  eligibilities = [],
  eligibilitiesV2 = [],
} = {}) {
  return new UserEligibilityList({
    userId,
    date,
    eligibilities,
    eligibilitiesV2,
  });
};

export { buildUserEligibilityList };
