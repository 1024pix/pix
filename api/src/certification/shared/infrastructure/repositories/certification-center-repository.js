import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationCenter } from '../../../../shared/domain/models/CertificationCenter.js';
import { ComplementaryCertification } from '../../../complementary-certification/domain/models/ComplementaryCertification.js';

const CERTIFICATION_CENTERS_TABLE = 'certification-centers';
const HABILITATION_TABLE = 'complementary-certification-habilitations';

const toDomain = (certificationCenter, habilitations) => {
  const complementaryCertifications = habilitations.map((complementaryCertification) => {
    return new ComplementaryCertification({
      id: complementaryCertification.id,
      key: complementaryCertification.key,
      label: complementaryCertification.label,
    });
  });
  return new CertificationCenter({
    ...certificationCenter,
    habilitations: complementaryCertifications,
  });
};

export const getBySessionId = async function ({ sessionId }) {
  const knexConnection = DomainTransaction.getConnection();
  const certificationCenter = await knexConnection(CERTIFICATION_CENTERS_TABLE)
    .innerJoin('sessions', 'sessions.certificationCenterId', 'certification-centers.id')
    .where({ 'sessions.id': sessionId })
    .first();

  if (!certificationCenter) throw new NotFoundError(`Could not find certification center for sessionId ${sessionId}.`);

  const habilitations = await knexConnection(HABILITATION_TABLE).where('certificationCenterId', certificationCenter.id);

  return toDomain(certificationCenter, habilitations);
};

export const findByExternalId = async ({ externalId }) => {
  const knexConnection = DomainTransaction.getConnection();

  const certificationCenter = await knexConnection(CERTIFICATION_CENTERS_TABLE).where({ externalId }).first();

  if (!certificationCenter) return null;

  const habilitations = await knexConnection(HABILITATION_TABLE)
    .where('certificationCenterId', certificationCenter.id)
    .orderBy('id');

  return toDomain(certificationCenter, habilitations);
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
