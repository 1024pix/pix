class Authentication {

  constructor({
    // attributes
    token,
    // embedded
    // relations
    userId,
  } = {}) {
    // attributes
    this.token = token;
    // embedded
    // relations
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
