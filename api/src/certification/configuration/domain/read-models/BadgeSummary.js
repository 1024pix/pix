export class BadgeSummary {
  constructor({ id, label, level, imageUrl, minimumEarnedPix, createdAt, detachedAt }) {
    this.id = id;
    this.label = label;
    this.level = level;
    this.imageUrl = imageUrl;
    this.minimumEarnedPix = minimumEarnedPix;
    this.createdAt = createdAt ?? null;
    this.detachedAt = detachedAt ?? null;
  }
}
