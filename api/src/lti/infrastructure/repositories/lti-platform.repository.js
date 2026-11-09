import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../db/pgsql-errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AlreadyExistingLtiPlatformError } from '../../domain/errors.js';
import { LtiPlatform } from '../../domain/models/LtiPlatform.js';

export const ltiPlatformRepository = {
  async get(id) {
    const knexConn = DomainTransaction.getConnection();

    const ltiPlatformDto = await knexConn.select('*').from('lti_platforms').where('id', id).first();

    if (!ltiPlatformDto) {
      throw new NotFoundError('unknown LTI platform id');
    }

    return toDomain(ltiPlatformDto);
  },

  async findByIssuer(issuer) {
    const knexConn = DomainTransaction.getConnection();

    const ltiPlatformDto = await knexConn.select('*').from('lti_platforms').where({ issuer }).first();

    if (!ltiPlatformDto) {
      return null;
    }

    return toDomain(ltiPlatformDto);
  },

  async findAll() {
    const knexConn = DomainTransaction.getConnection();

    const ltiPlatformDtos = await knexConn.select('*').from('lti_platforms').orderBy('issuer');

    return ltiPlatformDtos.map(toDomain);
  },

  async create({ issuer }) {
    const knexConn = DomainTransaction.getConnection();

    try {
      const [ltiPlatformDto] = await knexConn.insert({ issuer }).into('lti_platforms').returning('*');

      return toDomain(ltiPlatformDto);
    } catch (err) {
      if (err.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
        throw new AlreadyExistingLtiPlatformError(undefined, { cause: err });
      }
      throw err;
    }
  },
};

function toDomain(ltiPlatformDto) {
  return new LtiPlatform(ltiPlatformDto);
}
