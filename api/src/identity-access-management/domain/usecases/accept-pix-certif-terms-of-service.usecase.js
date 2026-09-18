/**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const acceptPixCertifTermsOfService = async function ({ userId,legalDocumentApiRepository }) {
  await legalDocumentApiRepository.acceptPixCertifTos({userId});
  //return userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);
};
