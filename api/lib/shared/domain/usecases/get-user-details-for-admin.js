const getUserDetailsForAdmin = async function ({ userId, userRepository }) {
  return await userRepository.getUserDetailsForAdmin(userId);
};

export { getUserDetailsForAdmin };
