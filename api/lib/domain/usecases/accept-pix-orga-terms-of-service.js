export default function acceptPixOrgaTermsOfService({ userId, userRepository }) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
}
