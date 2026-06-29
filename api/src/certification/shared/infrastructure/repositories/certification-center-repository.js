import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCenter } from '../../../../shared/domain/models/CertificationCenter.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';

export async function get({ id }) {
  const certificationCenterWithHabilitationsData = await certificationCenterWithHabilitationsBaseQuery().where({
    'certification-centers.id': id,
  });

  if (certificationCenterWithHabilitationsData.length === 0) {
    throw new NotFoundError(`Certification center with id: ${id} not found`);
  }

  return toDomain(certificationCenterWithHabilitationsData);
}

export async function getBySessionId({ sessionId }) {
  const certificationCenterWithHabilitationsData = await certificationCenterWithHabilitationsBaseQuery()
    .innerJoin('sessions', 'sessions.certificationCenterId', 'certification-centers.id')
    .where({ 'sessions.id': sessionId });

  if (certificationCenterWithHabilitationsData.length === 0) {
    throw new NotFoundError(`Could not find certification center for sessionId ${sessionId}.`);
  }

  return toDomain(certificationCenterWithHabilitationsData);
}

export async function findByExternalId({ externalId }) {
  const certificationCenterWithHabilitationsData = await certificationCenterWithHabilitationsBaseQuery().whereRaw(
    'LOWER("certification-centers"."externalId") = ?',
    [externalId.toLowerCase()],
  );

  if (certificationCenterWithHabilitationsData.length === 0) {
    return null;
  }

  return toDomain(certificationCenterWithHabilitationsData);
}

export async function getRefererEmails({ id }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .select('users.email')
    .join(
      'certification-center-memberships',
      'certification-center-memberships.certificationCenterId',
      'certification-centers.id',
    )
    .join('users', 'users.id', 'certification-center-memberships.userId')
    .where('certification-centers.id', id)
    .where('certification-center-memberships.isReferer', true);
}

function certificationCenterWithHabilitationsBaseQuery() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      externalId: 'certification-centers.externalId',
      type: 'certification-centers.type',
      createdAt: 'certification-centers.createdAt',
      updatedAt: 'certification-centers.updatedAt',
      archivedAt: 'certification-centers.archivedAt',
      archivedBy: 'certification-centers.archivedBy',
      complementaryCertificationId: 'complementary-certifications.id',
      complementaryCertificationKey: 'complementary-certifications.key',
      complementaryCertificationLabel: 'complementary-certifications.label',
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'complementary-certification-habilitations.certificationCenterId',
      'certification-centers.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certification-habilitations.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .orderBy('complementary-certifications.id');
}

function toDomain(certificationCenterWithHabilitationsData) {
  const habilitations = [];
  for (const habilitationData of certificationCenterWithHabilitationsData) {
    if (habilitationData.complementaryCertificationId) {
      habilitations.push(
        new ComplementaryCertification({
          id: habilitationData.complementaryCertificationId,
          label: habilitationData.complementaryCertificationLabel,
          key: habilitationData.complementaryCertificationKey,
        }),
      );
    }
  }
  return new CertificationCenter({
    ...certificationCenterWithHabilitationsData[0],
    habilitations,
  });
}
