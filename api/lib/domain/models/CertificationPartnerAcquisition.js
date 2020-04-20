const CERTIF_GREEN_ZONE = 'green_zone';
const CERTIF_RED_ZONE = 'red_zone';
const CERTIF_GREY_ZONE = 'grey_zone';

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
    reproducibilityRate = 0
  }) {
    if (!hasAcquiredBadge) return false;

    switch (this._getPartnerCertificationObtentionZone(reproducibilityRate)) {
      case CERTIF_GREEN_ZONE:
        return true;
      case CERTIF_RED_ZONE:
        return false;
      case CERTIF_GREY_ZONE:
        return this._checkCleaPixRate();
    }
  }

  _getPartnerCertificationObtentionZone(reproducibilityRate) {
    if (reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED) {
      return CERTIF_GREEN_ZONE;
    } else if (reproducibilityRate <= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED) {
      return CERTIF_RED_ZONE;
    }
    return CERTIF_GREY_ZONE;
  }

  _checkCleaPixRate() {
    // implémentation de la “zone grise” => mise en place d’un seuil, un nombre de Pix minimum à obtenir / compétence couvertes pas le référentiel Cléa numérique pour répondre au critère d’obtention du certif Cléa “avoir 75% des acquis validés par compétence”
    return false;
  }
}

module.exports = CertificationPartnerAcquisition;
