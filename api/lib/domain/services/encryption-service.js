const bcrypt = require('bcrypt');
const PasswordNotMatching = require('../errors').PasswordNotMatching;

const NUMBER_OF_SALT_ROUNDS = 5;

module.exports = {

  hashPassword: (password) => bcrypt.hash(password, NUMBER_OF_SALT_ROUNDS),

  /* eslint-disable-next-line no-sync */
  hashPasswordSync: (password) => bcrypt.hashSync(password, NUMBER_OF_SALT_ROUNDS),

  checkPassword: async ({ rawPassword, hashedPassword }) => {
    const matching = await bcrypt.compare(rawPassword, hashedPassword);
    if (!matching) {
      throw new PasswordNotMatching();
    }
  },

};
