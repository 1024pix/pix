import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { LtiPlatform } from '../../domain/models/LtiPlatform.js';

export const ltiPlatformRepository = {
  async findByOrigin(origin) {
    const knexConn = DomainTransaction.getConnection();

    const ltiPlatformDTO = await knexConn.select('*').from('lti_platforms').where('origin', origin).first();

    if (!ltiPlatformDTO) {
      return null;
    }

    return new LtiPlatform(ltiPlatformDTO);
  },
};
