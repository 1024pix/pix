import { MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY } from '../../../../shared/constants.js';

class UserCertificationEligibility {
  constructor({ id, isCertifiable, doubleCertificationEligibility, certifiableCompetencesCount }) {
    this.id = id;
    this.isCertifiable = isCertifiable;
    this.doubleCertificationEligibility = doubleCertificationEligibility;
    this.certifiableCompetencesCount = certifiableCompetencesCount;
    this.minimumCertifiableCompetencesForCertificability = MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
  }

  isDoubleCertificationOk() {
    return !!this.doubleCertificationEligibility && this.doubleCertificationEligibility.isBadgeValid;
  }
}

class CertificationEligibility {
  constructor({ label, imageUrl, isBadgeValid, validatedDoubleCertification }) {
    this.label = label;
    this.imageUrl = imageUrl;
    this.isBadgeValid = isBadgeValid;
    this.validatedDoubleCertification = validatedDoubleCertification;
  }
}

export { CertificationEligibility, UserCertificationEligibility };
