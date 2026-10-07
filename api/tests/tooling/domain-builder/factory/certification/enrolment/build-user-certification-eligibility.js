import { UserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';
import { MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY } from "../../../../../../src/shared/constants.js";
import { domainBuilder } from '../../../domain-builder.js';

const buildUserCertificationEligibility = function ({
  id = 123,
  isCertifiable = false,
  doubleCertificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility(),
  certifiableCompetencesCount = 0,
  minimumCertifiableCompetencesForCertificability = MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
} = {}) {
  return new UserCertificationEligibility({
    id,
    isCertifiable,
    doubleCertificationEligibility,
    certifiableCompetencesCount,
    minimumCertifiableCompetencesForCertificability,
  });
};

export { buildUserCertificationEligibility };
