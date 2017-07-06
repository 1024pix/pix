const User = require('../../domain/models/data/user');

module.exports = {
  findUserById(userId) {
    return User
      .where({ id: userId })
      .fetch({ require: true });
  }
};
