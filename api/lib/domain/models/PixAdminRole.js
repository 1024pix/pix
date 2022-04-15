class PixAdminRole {
  constructor({ id, userId, role, createdAt, updatedAt, disabledAt } = {}) {
    this.id = id;
    this.userId = userId;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
  }
}

module.exports = PixAdminRole;
