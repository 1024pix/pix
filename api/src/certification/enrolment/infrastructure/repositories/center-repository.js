// @ts-check
/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */
import { Organization } from '../../../../organizational-entities/domain/models/Organization.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Center, MatchingOrganization } from '../../domain/models/Center.js';
import { Habilitation } from '../../domain/models/Habilitation.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<Center>}
 * @throws {NotFoundError}
 */
export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const center = await knexConn
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      type: 'certification-centers.type',
      externalId: 'certification-centers.externalId',
      habilitations: knexConn.raw(
        `json_agg(json_build_object(
        'complementaryCertificationId', "complementary-certification-habilitations"."complementaryCertificationId",
        'key', "complementary-certifications"."key",
        'label', "complementary-certifications"."label"
        ) order by "complementary-certification-habilitations"."complementaryCertificationId")`,
      ),
      createdAt: 'certification-centers.createdAt',
      updatedAt: 'certification-centers.updatedAt',
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'certification-centers.id',
      'complementary-certification-habilitations.certificationCenterId',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-habilitations.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .where('certification-centers.id', '=', id)
    .groupBy('certification-centers.id')
    .first();

  if (!center) {
    throw new NotFoundError('Center not found');
  }
  let matchingOrganization = null;
  if (center.type === CERTIFICATION_CENTER_TYPES.SCO) {
    const organizationDB = await knexConn('organizations')
      .where({ type: Organization.types.SCO })
      .whereRaw('LOWER("externalId") = ?', center.externalId?.toLowerCase() ?? '')
      .first();
    matchingOrganization = organizationDB ? new MatchingOrganization(organizationDB) : null;
  }

  return toDomain(center, matchingOrganization);
}

/**
 * @typedef {object} CenterDTO
 * @property {number} id
 * @property {string} name
 * @property {string} type
 * @property {string} externalId
 * @property {Array<HabilitationDTO>} habilitations
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {object} HabilitationDTO
 * @property {number} complementaryCertificationId
 * @property {ComplementaryCertificationKeys} key
 * @property {string} label
 */

/**
 * @function
 * @param {CenterDTO} row
 * @param {MatchingOrganization | null} matchingOrganization
 * @returns {Center}
 */
function toDomain(row, matchingOrganization) {
  return new Center({
    id: row.id,
    name: row.name,
    externalId: row.externalId,
    type: row.type,
    habilitations: _toDomainHabilitation(row.habilitations),
    matchingOrganization,
  });
}

/**
 * @function
 * @param {Array<HabilitationDTO>} complementaryCertificationHabilitations
 * @returns {Array<Habilitation>}
 */
function _toDomainHabilitation(complementaryCertificationHabilitations = []) {
  return complementaryCertificationHabilitations
    .filter((data) => !!data.complementaryCertificationId)
    .map(
      ({ complementaryCertificationId, key, label }) => new Habilitation({ complementaryCertificationId, key, label }),
    );
}
