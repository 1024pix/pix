export default function acceptPixLastTermsOfService({ userId, userRepository }) {
  return userRepository.acceptPixLastTermsOfService(userId);
}
