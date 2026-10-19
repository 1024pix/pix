import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { LtiPlatform } from '../../domain/models/LtiPlatform.js';

export const ltiPlatformRepository = {
  async get(id) {
    const knexConn = DomainTransaction.getConnection();

    const ltiPlatformDTO = await knexConn.select('*').from('lti_platforms').where('id', id).first();

    if (!ltiPlatformDTO) {
      throw new NotFoundError('unknown LTI platform id');
    }

    return new LtiPlatform(ltiPlatformDTO);
  },

  async findByOrigin(origin) {
    const knexConn = DomainTransaction.getConnection();

    const ltiPlatformDTO = await knexConn.select('*').from('lti_platforms').where('origin', origin).first();

    if (!ltiPlatformDTO) {
      return null;
    }

    return new LtiPlatform(ltiPlatformDTO);
  },
};
