export default function acceptPixCertifTermsOfService({ userId, userRepository }) {
  return userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);
}
