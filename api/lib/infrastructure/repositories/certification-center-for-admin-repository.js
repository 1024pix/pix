const _ = require('lodash');

const { knex } = require('../../../db/knex-database-connection');
const CertificationCenterForAdmin = require('../../domain/models/CertificationCenterForAdmin');
const ComplementaryCertification = require('../../domain/models/ComplementaryCertification');
const { NotFoundError } = require('../../domain/errors');

const CERTIFICATION_CENTERS_TABLE_NAME = 'certification-centers';

module.exports = {
  async get(id) {
    const certificationCenter = await knex(CERTIFICATION_CENTERS_TABLE_NAME)
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
      })
      .leftJoin(
        'data-protection-officers',
        'data-protection-officers.certificationCenterId',
        'certification-centers.id'
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
        'complementary-certification-habilitations.complementaryCertificationId'
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
  },

  async save(certificationCenter) {
    const data = _.pick(certificationCenter, ['name', 'type', 'externalId']);
    const [certificationCenterCreated] = await knex(CERTIFICATION_CENTERS_TABLE_NAME).returning('*').insert(data);
    return _toDomain(certificationCenterCreated);
  },

  async update(certificationCenter) {
    const data = _.pick(certificationCenter, ['name', 'type', 'externalId']);

    const [certificationCenterRow] = await knex(CERTIFICATION_CENTERS_TABLE_NAME)
      .update(data)
      .where({ id: certificationCenter.id })
      .returning('*');

    return _toDomain(certificationCenterRow);
  },
};

function _toDomain(certificationCenterDTO) {
  return new CertificationCenterForAdmin({
    id: certificationCenterDTO.id,
    name: certificationCenterDTO.name,
    type: certificationCenterDTO.type,
    externalId: certificationCenterDTO.externalId,
    habilitations: certificationCenterDTO.habilitations,
    dataProtectionOfficerFirstName: certificationCenterDTO.dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName: certificationCenterDTO.dataProtectionOfficerLastName,
    dataProtectionOfficerEmail: certificationCenterDTO.dataProtectionOfficerEmail,
    createdAt: certificationCenterDTO.createdAt,
    updatedAt: certificationCenterDTO.updatedAt,
  });
}
