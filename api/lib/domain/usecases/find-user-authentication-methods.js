export default function findUserAuthenticationMethods({ userId, authenticationMethodRepository }) {
  return authenticationMethodRepository.findByUserId({ userId });
}
