import { CenterForAdmin } from '../../../../src/organizational-entities/domain/models/CenterForAdmin.js';

const buildCenterForAdmin = function ({ center, archivistFullName, dataProtectionOfficer } = {}) {
  return new CenterForAdmin({
    center,
    archivistFullName,
    dataProtectionOfficer,
  });
};

export { buildCenterForAdmin };
