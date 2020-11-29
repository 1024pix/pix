const bcrypt = require('bcrypt');
const PasswordNotMatching = require('../errors').PasswordNotMatching;

const NUMBER_OF_SALT_ROUNDS = 5;

module.exports = {
  hashPassword: (password) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, NUMBER_OF_SALT_ROUNDS, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  },

  /**
   * Not for usage on server. Script only, as the function is very CPU intensive and would block the server thread
   */
  hashPasswordSync: (password) => {
    /* eslint-disable-next-line no-sync */
    return bcrypt.hashSync(password, NUMBER_OF_SALT_ROUNDS);
  },

  checkPassword: ({ rawPassword, hashedPassword }) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(rawPassword, hashedPassword, (err, res) => {
        (res) ? resolve() : reject(new PasswordNotMatching());
      });
    });
  },
};
