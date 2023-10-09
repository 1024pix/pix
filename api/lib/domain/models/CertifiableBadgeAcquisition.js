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
    isOutdated,
  }) {
    this.badgeId = badgeId;
    this.badgeKey = badgeKey;
    this.campaignId = campaignId;
    this.complementaryCertificationId = complementaryCertificationId;
    this.complementaryCertificationKey = complementaryCertificationKey;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.complementaryCertificationBadgeImageUrl = complementaryCertificationBadgeImageUrl;
    this.complementaryCertificationBadgeLabel = complementaryCertificationBadgeLabel;
    this.isOutdated = isOutdated;
  }
}

export { CertifiableBadgeAcquisition };
