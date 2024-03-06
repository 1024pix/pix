class Passage {
  constructor({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
    this.id = id;
    this.moduleId = moduleId;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.terminatedAt = terminatedAt;
  }
}

export { Passage };
