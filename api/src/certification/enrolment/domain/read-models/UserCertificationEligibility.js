import { MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY } from '../../../../shared/constants.js';

class UserCertificationEligibility {
  constructor({ id, isCertifiable, doubleCertificationEligibility, certifiableCompetencesCount }) {
    this.id = id;
    this.isCertifiable = isCertifiable;
    this.doubleCertificationEligibility = doubleCertificationEligibility;
    this.certifiableCompetencesCount = certifiableCompetencesCount;
    this.minimumCertifiableCompetencesForCertificability = MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
  }

  isEligibleForDoubleCertification() {
    return !!this.doubleCertificationEligibility?.isEligible;
  }
}

class DoubleCertificationEligibility {
  constructor({ label, imageUrl, isEligible, certificationAlreadySucceeded }) {
    this.label = label;
    this.imageUrl = imageUrl;
    this.isEligible = isEligible;
    this.certificationAlreadySucceeded = certificationAlreadySucceeded;
  }
}

export { DoubleCertificationEligibility, UserCertificationEligibility };
