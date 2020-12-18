class UserOrgaSettings {

  constructor({
    id,
    currentOrganization,
    user,
  } = {}) {
    this.id = id;
    this.currentOrganization = currentOrganization;
    this.user = user;
  }

}

module.exports = UserOrgaSettings;
