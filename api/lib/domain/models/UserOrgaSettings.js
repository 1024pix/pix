class UserOrgaSettings {
  constructor({ id, currentOrganization, user } = {}) {
    this.id = id;
    this.currentOrganization = currentOrganization;
    this.user = user;
  }
}

export default UserOrgaSettings;
