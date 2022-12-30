class CertifiableBadgeAcquisition {
  constructor({
    badgeId,
    badgeKey,
    campaignId,
    complementaryCertificationId,
    complementaryCertificationKey,
    complementaryCertificationBadgeId,
    complementaryCertificationBadgeImageUrl,
    complementaryCertificationBadgeLabel,
  }) {
    this.badgeId = badgeId;
    this.badgeKey = badgeKey;
    this.campaignId = campaignId;
    this.complementaryCertificationId = complementaryCertificationId;
    this.complementaryCertificationKey = complementaryCertificationKey;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.complementaryCertificationBadgeImageUrl = complementaryCertificationBadgeImageUrl;
    this.complementaryCertificationBadgeLabel = complementaryCertificationBadgeLabel;
  }
}

module.exports = CertifiableBadgeAcquisition;
