class UserOrgaSettings {

  constructor({
    id,
    // includes
    currentOrganization,
    user,
  } = {}) {
    this.id = id;
    // includes
    this.currentOrganization = currentOrganization;
    this.user = user;
  }

}

module.exports = UserOrgaSettings;
