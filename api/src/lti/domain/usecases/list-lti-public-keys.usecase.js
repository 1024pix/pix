export async function listLtiPublicKeys({ ltiPlatformRegistrationRepository }) {
  return ltiPlatformRegistrationRepository.listActivePublicKeys();
}
