import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { CertificationCenterForAdmin } from '../../domain/models/CertificationCenterForAdmin.js';
import { ComplementaryCertification } from '../../domain/models/index.js';

const get = async function (id) {
  const certificationCenter = await knex('certification-centers')
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      type: 'certification-centers.type',
      externalId: 'certification-centers.externalId',
      dataProtectionOfficerFirstName: 'data-protection-officers.firstName',
      dataProtectionOfficerLastName: 'data-protection-officers.lastName',
      dataProtectionOfficerEmail: 'data-protection-officers.email',
      createdAt: 'certification-centers.createdAt',
      updatedAt: 'certification-centers.updatedAt',
      isV3Pilot: 'certification-centers.isV3Pilot',
      features: knex.raw('array_remove(array_agg("certificationCenterFeatures"."key"), NULL)'),
    })
    .leftJoin('data-protection-officers', 'data-protection-officers.certificationCenterId', 'certification-centers.id')
    .leftJoin(
      _getCertificationCenterFeatures({ id }),
      'certification-centers.id',
      'certificationCenterFeatures.certificationCenterId',
    )
    .groupBy(
      'certification-centers.id',
      'data-protection-officers.firstName',
      'data-protection-officers.lastName',
      'data-protection-officers.email',
    )
    .where('certification-centers.id', id)
    .first();

  if (!certificationCenter) {
    throw new NotFoundError(`Certification center with id: ${id} not found`);
  }

  const habilitations = await knex('complementary-certification-habilitations')
    .select({
      id: 'complementary-certification-habilitations.complementaryCertificationId',
      label: 'complementary-certifications.label',
      key: 'complementary-certifications.key',
    })
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-habilitations.complementaryCertificationId',
    )
    .where('complementary-certification-habilitations.certificationCenterId', id)
    .orderBy('complementary-certification-habilitations.complementaryCertificationId', 'asc');

  certificationCenter.habilitations = habilitations.map((habilitation) => {
    return new ComplementaryCertification({
      id: habilitation.id,
      key: habilitation.key,
      label: habilitation.label,
    });
  });

  return _toDomain(certificationCenter);
};

const save = async function (certificationCenter) {
  const data = _toDTO(certificationCenter);
  const [certificationCenterCreated] = await knex('certification-centers').returning('*').insert(data);
  return _toDomain(certificationCenterCreated);
};

const update = async function (certificationCenter) {
  const data = _toDTO(certificationCenter);

  const [certificationCenterRow] = await knex('certification-centers')
    .update(data)
    .where({ id: certificationCenter.id })
    .returning('*');

  return _toDomain(certificationCenterRow);
};

export { get, save, update };

function _toDomain(certificationCenterDTO) {
  return new CertificationCenterForAdmin(certificationCenterDTO);
}

function _toDTO(certificationCenter) {
  return _.pick(certificationCenter, ['name', 'type', 'externalId', 'isV3Pilot']);
}

function _getCertificationCenterFeatures({ id }) {
  return (builder) => {
    return builder
      .select('certification-center-features.certificationCenterId', 'features.key')
      .from('certification-center-features')
      .innerJoin('features', 'features.id', 'certification-center-features.featureId')
      .where('certification-center-features.certificationCenterId', '=', id)
      .as('certificationCenterFeatures');
  };
}
