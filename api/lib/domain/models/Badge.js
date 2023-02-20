class Badge {
  constructor({
    id,
    key,
    altMessage,
    imageUrl,
    message,
    title,
    isCertifiable,
    badgeCriteria = [],
    skillSets = [],
    targetProfileId,
    isAlwaysVisible = false,
    complementaryCertificationBadge = null,
  } = {}) {
    this.id = id;
    this.altMessage = altMessage;
    this.imageUrl = imageUrl;
    this.message = message;
    this.title = title;
    this.key = key;
    this.isCertifiable = isCertifiable;
    this.badgeCriteria = badgeCriteria;
    this.skillSets = skillSets;
    this.targetProfileId = targetProfileId;
    this.isAlwaysVisible = isAlwaysVisible;
    this.complementaryCertificationBadge = complementaryCertificationBadge;
  }
}

export default Badge;
