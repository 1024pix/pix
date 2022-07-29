module.exports = async function addAdminRole({ email, role, userRepository }) {
  const user = await userRepository.getByEmail(email);
  user.addAdminRole(role);
  await userRepository.save(user);
  return user;
};
