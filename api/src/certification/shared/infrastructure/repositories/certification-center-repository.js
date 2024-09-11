import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCenter } from '../../../../shared/domain/models/CertificationCenter.js';
import { ComplementaryCertification } from '../../../complementary-certification/domain/models/ComplementaryCertification.js';

const toDomain = (certificationCenter) => {
  const habilitations = certificationCenter.habilitations.map((dbComplementaryCertification) => {
    return new ComplementaryCertification(dbComplementaryCertification);
  });
  return new CertificationCenter({
    ...certificationCenter,
    habilitations,
  });
};

const getComplementaryCertifications = async (knexConnection, certificationCenter) =>
  await knexConnection('complementary-certifications')
    .select([
      'complementary-certifications.id',
      'complementary-certifications.key',
      'complementary-certifications.label',
    ])
    .join(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .where('complementary-certification-habilitations.certificationCenterId', certificationCenter.id)
    .orderBy('complementary-certifications.id');

export const get = async function ({ id }) {
  const knexConnection = DomainTransaction.getConnection();

  const certificationCenter = await knexConnection('certification-centers').orderBy('id', 'desc').where({ id }).first();

  if (!certificationCenter) {
    throw new NotFoundError(`Certification center with id: ${id} not found`);
  }
  const complementaryCertifications = await getComplementaryCertifications(knexConnection, certificationCenter);
  return toDomain({
    ...certificationCenter,
    habilitations: complementaryCertifications,
  });
};

export const getBySessionId = async ({ sessionId }) => {
  const knexConnection = DomainTransaction.getConnection();

  const certificationCenter = await knexConnection('certification-centers')
    .select(
      'certification-centers.id',
      'certification-centers.name',
      'certification-centers.externalId',
      'certification-centers.type',
      'certification-centers.createdAt',
      'certification-centers.updatedAt',
    )
    .where({ 'sessions.id': sessionId })
    .innerJoin('sessions', 'sessions.certificationCenterId', 'certification-centers.id')
    .first();

  if (!certificationCenter) {
    throw new NotFoundError(`Could not find certification center for sessionId ${sessionId}.`);
  }
  const complementaryCertifications = await getComplementaryCertifications(knexConnection, certificationCenter);
  return toDomain({
    ...certificationCenter,
    habilitations: complementaryCertifications,
  });
};

export const findByExternalId = async ({ externalId }) => {
  const knexConnection = DomainTransaction.getConnection();

  const certificationCenter = await knexConnection('certification-centers').where({ externalId }).first();
  if (!certificationCenter) {
    return null;
  }

  const complementaryCertifications = await getComplementaryCertifications(knexConnection, certificationCenter);
  return toDomain({
    ...certificationCenter,
    habilitations: complementaryCertifications,
  });
};

export const getRefererEmails = async ({ id }) =>
  await knex('certification-centers')
    .select('users.email')
    .join(
      'certification-center-memberships',
      'certification-center-memberships.certificationCenterId',
      'certification-centers.id',
    )
    .join('users', 'users.id', 'certification-center-memberships.userId')
    .where('certification-centers.id', id)
    .where('certification-center-memberships.isReferer', true);
