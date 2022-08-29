const bcrypt = require('bcrypt');
const { bcryptNumberOfSaltRounds } = require('../../config');
const UserNotFoundError = require('../errors').UserNotFoundError;

module.exports = {
  hashPassword: (password) => bcrypt.hash(password, bcryptNumberOfSaltRounds),

  /* eslint-disable-next-line no-sync */
  hashPasswordSync: (password) => bcrypt.hashSync(password, bcryptNumberOfSaltRounds),

  checkPassword: async ({ password, passwordHash }) => {
    const matching = await bcrypt.compare(password, passwordHash);
    if (!matching) {
      throw new UserNotFoundError();
    }
  },
};
