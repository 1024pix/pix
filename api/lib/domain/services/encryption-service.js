const bcrypt = require('bcrypt');
const { bcryptNumberOfSaltRounds } = require('../../config.js');
const PasswordNotMatching = require('../errors.js').PasswordNotMatching;

const hashPassword = function (password) {
  return bcrypt.hash(password, bcryptNumberOfSaltRounds);
};

const hashPasswordSync = function (password) {
  // eslint-disable-next-line no-sync
  return bcrypt.hashSync(password, bcryptNumberOfSaltRounds);
};

const checkPassword = async function ({ password, passwordHash }) {
  const matching = await bcrypt.compare(password, passwordHash);
  if (!matching) {
    throw new PasswordNotMatching();
  }
};

module.exports = {
  hashPassword,
  hashPasswordSync,
  checkPassword,
};
