class CertifiableBadgeAcquisition {
  constructor({ id, badge, userId, campaignId, complementaryCertification } = {}) {
    this.id = id;
    this.badge = badge;
    this.userId = userId;
    this.campaignId = campaignId;
    this.complementaryCertification = complementaryCertification;
  }

  get badgeKey() {
    return this.badge.key;
  }
}

module.exports = CertifiableBadgeAcquisition;
