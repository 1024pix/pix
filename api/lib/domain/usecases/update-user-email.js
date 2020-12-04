module.exports = async function updateUserEmail({
  email,
  userId,
  userRepository,
}) {
  await userRepository.isEmailAvailable(email);
  await userRepository.updateEmail({ id: userId, email });
};
