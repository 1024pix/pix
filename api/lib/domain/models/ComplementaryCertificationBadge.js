class ComplementaryCertificationBadge {
  constructor({
    id,
    level,
    complementaryCertificationId,
    badgeId,
    createdAt,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    detachedAt,
    createdBy,
  }) {
    this.id = id;
    this.level = level;
    this.complementaryCertificationId = complementaryCertificationId;
    this.badgeId = badgeId;
    this.createdAt = createdAt;
    this.imageUrl = imageUrl;
    this.label = label;
    this.certificateMessage = certificateMessage;
    this.temporaryCertificateMessage = temporaryCertificateMessage;
    this.stickerUrl = stickerUrl;
    this.detachedAt = detachedAt;
    this.createdBy = createdBy;
  }
}

export { ComplementaryCertificationBadge };
