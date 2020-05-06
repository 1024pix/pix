const CERTIF_GREEN_ZONE = 'green_zone';
const CERTIF_RED_ZONE = 'red_zone';

const { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED } = require('../constants');

class CertificationPartnerAcquisition {
  constructor(
    {
      certificationCourseId,
      partnerKey,

    } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
  }

  hasAcquiredCertification({
    hasAcquiredBadge = false,
    percentageCorrectAnswers = 0 }) {
    if (!hasAcquiredBadge) return false;

    switch (this._getPartnerCertificationObtentionZone(percentageCorrectAnswers)) {
      case CERTIF_GREEN_ZONE:
        return true;
      case CERTIF_RED_ZONE:
        return false;
        // case ZONE_GRISE
        // zone grise
    }
  }

  _getPartnerCertificationObtentionZone(percentageCorrectAnswers) {
    if (percentageCorrectAnswers >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED) {
      return CERTIF_GREEN_ZONE;
    } else if (percentageCorrectAnswers <= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED) {
      return CERTIF_RED_ZONE;
    }

    return null;
  }
}

module.exports = CertificationPartnerAcquisition;
