const { NotFoundError } = require('../../domain/errors');

module.exports = async function getUserInfo({ 
  userId, 
  userRepository,
}) {
  const ERROR_MESSAGE = `L'utilisateur ${userId} n'existe pas.`;
  const integerUserId = parseInt(userId);
  if (!Number.isFinite(integerUserId)) {
    throw new NotFoundError(ERROR_MESSAGE);
  }

  let user;
  try {
    user = await userRepository.get(userId);
  } catch (err) {
    throw new NotFoundError(ERROR_MESSAGE);
  }
  return user;
};
