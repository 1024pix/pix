class TargetProfileHistoryForAdmin {
  constructor({ id, name, attachedAt, detachedAt = null, badges = [] }) {
    this.id = id;
    this.name = name;
    this.attachedAt = attachedAt;
    this.detachedAt = detachedAt;
    this.badges = badges;
  }
}

export { TargetProfileHistoryForAdmin };
