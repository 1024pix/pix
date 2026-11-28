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

  /**
   * @param {LtiPlatformRegistration} registration
   */
  async create({ clientId, platformId, status, toolConfig, encryptedPrivateKey, publicKey, platformOpenIdConfigUrl }) {
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

  /**
   * @param {LtiPlatformRegistration} registration
   */
  async update({ clientId, status }) {
    const knexConn = DomainTransaction.getConnection();
    const [ltiPlatformRegistrationDTO] = await knexConn('lti_platform_registrations')
      .update({
        status,
        updatedAt: knexConn.fn.now(),
      })
      .where({ clientId })
      .returning('*');

    const platform = await ltiPlatformRepository.get(ltiPlatformRegistrationDTO.platformId);

    return toDomain(ltiPlatformRegistrationDTO, platform);
  },

  async findAllByPlatformId({ platformId }) {
    const knexConn = DomainTransaction.getConnection();
    const ltiPlatformRegistrationDtos = await knexConn
      .select('*')
      .from('lti_platform_registrations')
      .where('platformId', platformId)
      .orderBy('clientId');

    if (ltiPlatformRegistrationDtos.length === 0) {
      return [];
    }

    const platform = await ltiPlatformRepository.get(platformId);

    return ltiPlatformRegistrationDtos.map((ltiPlatformRegistrationDto) =>
      toDomain(ltiPlatformRegistrationDto, platform),
    );
  },
};

function toDomain(ltiPlatformRegistrationDTO, platform) {
  return new LtiPlatformRegistration({ ...ltiPlatformRegistrationDTO, platform });
}
