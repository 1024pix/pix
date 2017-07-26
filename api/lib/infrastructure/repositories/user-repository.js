const User = require('../../domain/models/data/user');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  findByEmail(email) {
    return User
      .where({ email })
      .fetch({ require: true })
      .catch((err) => {
        return Promise.reject(new NotFoundError(err));
      });
  },

  findUserById(userId) {
    return User
      .where({ id: userId })
      .fetch({ require: true });
  },

  save(userRawData) {
    return new User(userRawData).save();
  }
};
