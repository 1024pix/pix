class ComplementaryCertificationBadge {
  constructor({
    id,
    createdAt,
    complementaryCertificationId,
    badgeId,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    level,
    minimumEarnedPix,
    detachedAt,
    createdBy,
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.complementaryCertificationId = complementaryCertificationId;
    this.badgeId = badgeId;
    this.imageUrl = imageUrl;
    this.label = label;
    this.certificateMessage = certificateMessage;
    this.temporaryCertificateMessage = temporaryCertificateMessage;
    this.stickerUrl = stickerUrl;
    this.level = level;
    this.minimumEarnedPix = minimumEarnedPix;
    this.detachedAt = detachedAt;
    this.createdBy = createdBy;
  }
}

export { ComplementaryCertificationBadge };
