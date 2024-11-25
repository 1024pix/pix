class UserOrgaSettings {
  constructor({ id, currentOrganization, user, createdAt, updatedAt } = {}) {
    this.id = id;
    this.currentOrganization = currentOrganization;
    this.user = user;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { UserOrgaSettings };
