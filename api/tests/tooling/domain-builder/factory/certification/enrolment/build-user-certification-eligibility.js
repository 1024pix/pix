import { UserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';
import { domainBuilder } from '../../../domain-builder.js';

const buildUserCertificationEligibility = function ({
  id = 123,
  isCertifiable = false,
  certificationEligibilities = [domainBuilder.certification.enrolment.buildV3CertificationEligibility()],
} = {}) {
  return new UserCertificationEligibility({
    id,
    isCertifiable,
    certificationEligibilities,
  });
};

export { buildUserCertificationEligibility };
