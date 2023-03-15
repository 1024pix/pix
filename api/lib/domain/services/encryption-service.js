import bcrypt from 'bcrypt';
import { config } from '../../config.js';
import { PasswordNotMatching } from '../errors.js';
const { bcryptNumberOfSaltRounds } = config;
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

export { hashPassword, hashPasswordSync, checkPassword };
