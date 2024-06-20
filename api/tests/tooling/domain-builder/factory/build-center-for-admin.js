import { CenterForAdmin } from '../../../../src/certification/enrolment/domain/models/CenterForAdmin.js';

const buildCenterForAdmin = function ({ center, dataProtectionOfficer } = {}) {
  return new CenterForAdmin({
    center,
    dataProtectionOfficer,
  });
};

export { buildCenterForAdmin };
