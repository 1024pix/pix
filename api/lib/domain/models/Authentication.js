class Authentication {

  constructor({
    // attributes
    token,
    // includes
    // references
    userId,
  } = {}) {
    // attributes
    this.token = token;
    // includes
    // references
    this.userId = userId;
  }

  toJSON() {
    return {
      user_id: this.userId,
      token: this.token,
    };
  }

}

module.exports = Authentication;
