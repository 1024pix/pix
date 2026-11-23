import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../db/pgsql-errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AlreadyExistingLtiPlatformError } from '../../domain/errors.js';
import { LtiPlatform } from '../../domain/models/LtiPlatform.js';

export const ltiPlatformRepository = {
  async get(id) {
    const ltiPlatformDto = await selectPlatform().where('id', id).first();

    if (!ltiPlatformDto) {
      throw new NotFoundError('unknown LTI platform id');
    }

    return toDomain(ltiPlatformDto);
  },

  async findByIssuer(issuer) {
    const ltiPlatformDto = await selectPlatform().where({ issuer }).first();

    if (!ltiPlatformDto) {
      return null;
    }

    return toDomain(ltiPlatformDto);
  },

  async findAll() {
    const ltiPlatformDtos = await selectPlatform().orderBy('issuer');

    return ltiPlatformDtos.map(toDomain);
  },

  async create({ issuer }) {
    const knexConn = DomainTransaction.getConnection();

    try {
      const [ltiPlatformDto] = await knexConn
        .insert({ issuer })
        .into('lti_platforms')
        .returning(platformProjection(knexConn));

      return toDomain(ltiPlatformDto);
    } catch (err) {
      if (err.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
        throw new AlreadyExistingLtiPlatformError(undefined, { cause: err });
      }
      throw err;
    }
  },
};

function selectPlatform(knexConn = DomainTransaction.getConnection()) {
  return knexConn.select(platformProjection(knexConn)).from('lti_platforms');
}

function platformProjection(knexConn = DomainTransaction.getConnection()) {
  return [
    'lti_platforms.*',
    knexConn.raw(
      'coalesce((??), \'[]\') as "organizationIds"',
      knexConn
        .select(
          knexConn.raw('json_agg(?? order by ??)', [
            'lti_platform_organizations.organizationId',
            'lti_platform_organizations.organizationId',
          ]),
        )
        .from('lti_platform_organizations')
        .whereColumn('lti_platform_organizations.platformId', 'lti_platforms.id'),
    ),
  ];
}

function toDomain(ltiPlatformDto) {
  return new LtiPlatform(ltiPlatformDto);
}
