export default async function getUserDetailsForAdmin({ userId, userRepository }) {
  return await userRepository.getUserDetailsForAdmin(userId);
}
