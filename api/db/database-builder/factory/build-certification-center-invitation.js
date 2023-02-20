import databaseBuffer from '../database-buffer';

const TABLE_NAME = 'certification-center-invitations';

export default function buildCertificationCenterInvitation({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  email = 'anemail@example.net',
  status = 'pending',
  code = 'ABCDEF123',
  createdAt = new Date(),
  updatedAt = new Date(),
}) {
  const values = {
    id,
    certificationCenterId,
    email,
    status,
    code,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: TABLE_NAME,
    values,
  });
}
