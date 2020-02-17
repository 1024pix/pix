class Badge {
  constructor({
    id,
    // attributes
    imageUrl,
    message,
    // includes
    // references
    targetProfileId,
  } = {}) {
    this.id = id;
    // attributes
    this.imageUrl = imageUrl;
    this.message = message;
    // includes
    // references
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Badge;
