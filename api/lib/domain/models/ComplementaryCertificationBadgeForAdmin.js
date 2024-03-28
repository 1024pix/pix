class ComplementaryCertificationBadgeForAdmin {
  /**
   * @param {Object} params
   * @param {number} params.id - Pix core badge identifier
   * @param {number} params.complementaryCertificationBadgeId - Complementary certification badge identifier
   * @param {string} params.label
   * @param {number} params.level
   * @param {string} params.imageUrl
   * @param {number} params.minimumEarnedPix
   */
  constructor({ id, complementaryCertificationBadgeId, label, level, imageUrl, minimumEarnedPix }) {
    this.id = id;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.label = label;
    this.level = level;
    this.imageUrl = imageUrl;
    this.minimumEarnedPix = minimumEarnedPix;
  }
}

export { ComplementaryCertificationBadgeForAdmin };
