import { ltiPlatformRegistrationRepository as injectedLtiPlatformRegistrationRepository } from '../../infrastructure/repositories/lti-platform-registration.repository.js';
export async function listLtiPublicKeys({
  ltiPlatformRegistrationRepository = injectedLtiPlatformRegistrationRepository,
} = {}) {
  return ltiPlatformRegistrationRepository.listActivePublicKeys();
}
