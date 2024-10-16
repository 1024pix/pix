export class ComplementaryCertificationBadgeWithOffsetVersion {
  constructor({
    id,
    requiredPixScore,
    level,
    offsetVersion,
    currentAttachedComplementaryCertificationBadgeId,
    label,
    imageUrl,
    isOutdated,
  }) {
    this.id = id;
    this.requiredPixScore = requiredPixScore;
    this.level = level;
    this.offsetVersion = offsetVersion;
    this.label = label;
    this.imageUrl = imageUrl;
    this.isOutdated = isOutdated;
    this.currentAttachedComplementaryCertificationBadgeId = currentAttachedComplementaryCertificationBadgeId;
  }
}
