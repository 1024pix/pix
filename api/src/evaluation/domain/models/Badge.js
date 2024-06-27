const UPDATABLE_PROPERTIES = ['message', 'altMessage', 'key', 'title', 'imageUrl', 'isCertifiable', 'isAlwaysVisible'];

class Badge {
  constructor({
    id,
    key,
    altMessage,
    imageUrl,
    message,
    title,
    isCertifiable,
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
    this.targetProfileId = targetProfileId;
    this.isAlwaysVisible = isAlwaysVisible;
    this.complementaryCertificationBadge = complementaryCertificationBadge;
  }

  updateBadgeProperties(badgeToUpdate) {
    UPDATABLE_PROPERTIES.forEach((property) => {
      if (badgeToUpdate[property]) this[property] = badgeToUpdate[property];
    });
  }
}

export { Badge };
