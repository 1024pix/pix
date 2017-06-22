class Authentication {

  constructor(user_id, token) {
    this.user_id = user_id;
    this.token = token;
  }

  toJSON() {
    return {
      user_id: this.user_id,
      token: this.token
    };
  }

}

module.exports = Authentication;
