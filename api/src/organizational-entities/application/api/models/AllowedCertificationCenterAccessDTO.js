/**
 * @class AllowedCertificationCenterAccessDTO
 */
export class AllowedCertificationCenterAccessDTO {
  /**
   * @param {Object} params
   * @param {boolean} params.isAccessBlockedCollege
   * @param {boolean} params.isAccessBlockedLycee
   * @param {boolean} params.isAccessBlockedAEFE
   * @param {boolean} params.isAccessBlockedAgri
   * @param {string|null} params.pixCertifScoBlockedAccessDateCollege
   * @param {string|null} params.pixCertifScoBlockedAccessDateLycee
   */
  constructor({
    isAccessBlockedCollege = false,
    isAccessBlockedLycee = false,
    isAccessBlockedAEFE = false,
    isAccessBlockedAgri = false,
    pixCertifScoBlockedAccessDateCollege = null,
    pixCertifScoBlockedAccessDateLycee = null,
  } = {}) {
    this.isAccessBlockedCollege = !!isAccessBlockedCollege;
    this.isAccessBlockedLycee = !!isAccessBlockedLycee;
    this.isAccessBlockedAEFE = !!isAccessBlockedAEFE;
    this.isAccessBlockedAgri = !!isAccessBlockedAgri;
    this.pixCertifScoBlockedAccessDateCollege = pixCertifScoBlockedAccessDateCollege;
    this.pixCertifScoBlockedAccessDateLycee = pixCertifScoBlockedAccessDateLycee;
  }
}
