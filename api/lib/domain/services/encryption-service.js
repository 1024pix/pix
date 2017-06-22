const bcrypt = require('bcrypt');

const PasswordNotMatching = require('../errors').PasswordNotMatching;

module.exports = {
  hashPassword: (password) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 5, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  },

  check: (plain, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plain, hash, (err, res) => {
        (res) ? resolve() : reject(new PasswordNotMatching());
      });
    });
  }
};
