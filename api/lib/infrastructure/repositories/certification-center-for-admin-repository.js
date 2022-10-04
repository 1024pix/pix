const { knex } = require('../../../db/knex-database-connection');
const CertificationCenterForAdmin = require('../../domain/models/CertificationCenterForAdmin');
const ComplementaryCertification = require('../../domain/models/ComplementaryCertification');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async get(id) {
    const certificationCenter = await knex('certification-centers')
      .select({
        id: 'certification-centers.id',
        name: 'certification-centers.name',
        type: 'certification-centers.type',
        externalId: 'certification-centers.externalId',
        isSupervisorAccessEnabled: 'certification-centers.isSupervisorAccessEnabled',
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

    return new CertificationCenterForAdmin({
      id: certificationCenter.id,
      name: certificationCenter.name,
      type: certificationCenter.type,
      externalId: certificationCenter.externalId,
      habilitations: certificationCenter.habilitations,
      isSupervisorAccessEnabled: certificationCenter.isSupervisorAccessEnabled,
      dataProtectionOfficerFirstName: certificationCenter.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: certificationCenter.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: certificationCenter.dataProtectionOfficerEmail,
      createdAt: certificationCenter.createdAt,
      updatedAt: certificationCenter.updatedAt,
    });
  },
};
