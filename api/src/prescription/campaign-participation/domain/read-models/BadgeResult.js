class BadgeResult {
  constructor(badge, acquiredBadgeIds) {
    this.id = badge.id;
    this.title = badge.title;
    this.message = badge.message;
    this.altMessage = badge.altMessage;
    this.key = badge.key;
    this.imageUrl = badge.imageUrl;
    this.isAcquired = acquiredBadgeIds.includes(badge.id);
    this.isAlwaysVisible = badge.isAlwaysVisible;
    this.isCertifiable = badge.isCertifiable;
    this.isValid = badge.isValid;
    this.acquisitionPercentage = badge.acquisitionPercentage;
  }
}

export { BadgeResult };
