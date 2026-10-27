import { databaseBuffer } from '../database-buffer.ts';

type ResetPasswordDemandAttributes = {
  id?: number;
  email?: string;
  temporaryKey?: string;
  used?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const buildResetPasswordDemand = ({
  id = databaseBuffer.getNextId(),
  email = 'example@example.net',
  temporaryKey = 'ABCD12345',
  used = false,
  createdAt,
  updatedAt,
}: ResetPasswordDemandAttributes = {}) => {
  const values = { id, email, temporaryKey, used, createdAt, updatedAt };
  return databaseBuffer.pushInsertable({ tableName: 'reset-password-demands', values });
};

export { buildResetPasswordDemand };
