const User = require('../../domain/models/data/user');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');

module.exports = {

  findByEmail(email) {
    return User
      .where({ email })
      .fetch({ require: true });
  },

  findUserById(userId) {
    return User
      .where({ id: userId })
      .fetch({ require: true });
  },

  save(userRawData) {
    return new User(userRawData).save();
  },

  validateData(userRawData) {
    return new User(userRawData).validationErrors();
  },

  isEmailAvailable(email) {
    return User
      .where({ email })
      .fetch()
      .then(user => {
        if (user) {
          return Promise.reject(new AlreadyRegisteredEmailError());
        }

        return Promise.resolve(email);
      });
  },

  updatePassword(id, password) {
    return User.where({ id }).save({ password, cgu: true }, {
      patch: true,
      require: false
    });
  },

  countUserById(id) {
    return User.where({ id }).count('id');
  }
};
