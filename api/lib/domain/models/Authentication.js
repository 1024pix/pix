class Authentication {

  constructor({ userId, token }) {
    this.userId = userId;
    this.token = token;
  }

  toJSON() {
    return {
      user_id: this.userId,
      token: this.token,
    };
  }

}

module.exports = Authentication;
