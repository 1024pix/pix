import { UserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';
import { domainBuilder } from '../../../domain-builder.js';

const buildUserCertificationEligibility = function ({
  id = 123,
  isCertifiable = false,
  doubleCertificationEligibility = domainBuilder.certification.enrolment.buildDoubleCertificationEligibility(),
} = {}) {
  return new UserCertificationEligibility({
    id,
    isCertifiable,
    doubleCertificationEligibility,
  });
};

export { buildUserCertificationEligibility };
