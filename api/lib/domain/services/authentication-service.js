const encryptionService = require('./encryption-service');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRoles(username);
  await encryptionService.check(password, foundUser.password);
  return foundUser;
}

module.exports = {
  getUserByUsernameAndPassword,
};
