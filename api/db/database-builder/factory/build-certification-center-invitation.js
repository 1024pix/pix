import { databaseBuffer } from '../database-buffer.ts';

const TABLE_NAME = 'certification-center-invitations';

const buildCertificationCenterInvitation = function ({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  email = 'anemail@example.net',
  status = 'pending',
  role = 'MEMBER',
  locale = 'fr',
  code = 'ABCDEF123',
  createdAt = new Date(),
  updatedAt = new Date(),
}) {
  const values = {
    id,
    certificationCenterId,
    email,
    status,
    role,
    locale,
    code,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: TABLE_NAME,
    values,
  });
};

export { buildCertificationCenterInvitation };
