import { UserCertificability } from '../../../../../../src/certification/enrolment/domain/models/UserCertificability.js';

const buildUserCertificability = function ({
  userId = 123,
  certificability = [{ key: 'data' }],
  certificabilityV2 = [{ keyV2: 'dataV2' }],
}) {
  return new UserCertificability({
    userId,
    certificability,
    certificabilityV2,
  });
};

export { buildUserCertificability };
