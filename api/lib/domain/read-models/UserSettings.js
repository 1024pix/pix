class UserSettings {
  constructor({ id, color, userId, createdAt, updatedAt }) {
    this.id = id;
    this.color = color;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { UserSettings };
