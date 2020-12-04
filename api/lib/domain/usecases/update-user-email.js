module.exports = async function updateUserEmail({
  email,
  userId,
  userRepository,
}) {
  await userRepository.updateEmail({ id: userId, email });
};
