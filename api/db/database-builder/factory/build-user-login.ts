import { databaseBuffer } from '../database-buffer.ts';
import { buildUser } from './build-user.ts';

type UserLoginAttributes = {
  id?: number;
  userId?: number | null;
  failureCount?: number;
  temporaryBlockedUntil?: Date | null;
  blockedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoggedAt?: Date | null;
};

const buildUserLogin = ({
  id = databaseBuffer.getNextId(),
  userId = null,
  failureCount = 0,
  temporaryBlockedUntil = null,
  blockedAt = null,
  createdAt = new Date(),
  updatedAt = new Date(),
  lastLoggedAt = null,
}: UserLoginAttributes = {}) => {
  const values = {
    id,
    userId: userId || buildUser().id,
    failureCount,
    temporaryBlockedUntil,
    blockedAt,
    createdAt,
    updatedAt,
    lastLoggedAt,
  };
  return databaseBuffer.pushInsertable({ tableName: 'user-logins', values });
};

export { buildUserLogin };
