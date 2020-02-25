class Badge {
  constructor({
    id,
    // attributes
    altMessage,
    imageUrl,
    message,
    // includes
    // references
    targetProfileId,
  } = {}) {
    this.id = id;
    // attributes
    this.altMessage = altMessage;
    this.imageUrl = imageUrl;
    this.message = message;
    // includes
    // references
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Badge;
