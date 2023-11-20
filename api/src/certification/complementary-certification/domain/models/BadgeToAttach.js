class BadgeToAttach {
  constructor({
    level,
    complementaryCertificationId,
    badgeId,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    createdBy,
    minimumEarnedPix,
  }) {
    this.level = level;
    this.complementaryCertificationId = complementaryCertificationId;
    this.badgeId = badgeId;
    this.imageUrl = imageUrl;
    this.label = label;
    this.certificateMessage = certificateMessage;
    this.temporaryCertificateMessage = temporaryCertificateMessage;
    this.stickerUrl = stickerUrl;
    this.createdBy = createdBy;
    this.minimumEarnedPix = minimumEarnedPix ?? 0;
  }

  static from({
    level,
    complementaryCertificationId,
    badgeId,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    userId,
    minimumEarnedPix,
  }) {
    return new BadgeToAttach({
      id: undefined,
      level,
      complementaryCertificationId,
      badgeId,
      imageUrl,
      label,
      certificateMessage,
      temporaryCertificateMessage,
      stickerUrl,
      detachedAt: null,
      createdBy: userId,
      minimumEarnedPix: minimumEarnedPix,
    });
  }
}

export { BadgeToAttach };
