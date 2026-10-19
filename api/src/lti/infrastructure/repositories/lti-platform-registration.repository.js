import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { LtiPlatformRegistration } from '../../domain/models/LtiPlatformRegistration.js';
import { ltiPlatformRepository } from './lti-platform.repository.js';

export const ltiPlatformRegistrationRepository = {
  async findByClientId(clientId) {
    const knexConn = DomainTransaction.getConnection();
    const ltiPlatformRegistrationDTO = await knexConn
      .select('*')
      .from('lti_platform_registrations')
      .where('clientId', clientId)
      .first();

    if (!ltiPlatformRegistrationDTO) {
      return null;
    }

    const platform = await ltiPlatformRepository.get(ltiPlatformRegistrationDTO.platformId);

    return toDomain(ltiPlatformRegistrationDTO, platform);
  },

  async listActivePublicKeys() {
    const knexConn = DomainTransaction.getConnection();
    return knexConn.select('publicKey').from('lti_platform_registrations').where('status', 'active').pluck('publicKey');
  },

  async save({ clientId, platformId, status, toolConfig, encryptedPrivateKey, publicKey, platformOpenIdConfigUrl }) {
    const knexConn = DomainTransaction.getConnection();
    const [ltiPlatformRegistrationDTO] = await knexConn('lti_platform_registrations')
      .insert({
        clientId,
        platformId,
        status,
        toolConfig,
        encryptedPrivateKey,
        publicKey,
        platformOpenIdConfigUrl,
      })
      .returning('*');

    const platform = await ltiPlatformRepository.get(ltiPlatformRegistrationDTO.platformId);

    return toDomain(ltiPlatformRegistrationDTO, platform);
  },
};

function toDomain(ltiPlatformRegistrationDTO, platform) {
  return new LtiPlatformRegistration({ ...ltiPlatformRegistrationDTO, platform });
}
