class Authentication {
  constructor({ token, userId } = {}) {
    this.token = token;
    this.userId = userId;
  }

  toJSON() {
    return {
      user_id: this.userId,
      token: this.token,
    };
  }
}

export default Authentication;
