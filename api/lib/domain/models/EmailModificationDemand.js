class EmailModificationDemand {

  constructor({
    code,
    newEmail,
  } = {}) {
    this.code = code;
    this.newEmail = newEmail;
  }
}

module.exports = EmailModificationDemand;
