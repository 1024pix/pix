import { databaseBuffer } from '../database-buffer.ts';

type PixAdminRoleAttributes = {
  id?: number;
  userId: number;
  role: string;
  createdAt?: Date;
  updatedAt?: Date | null;
  disabledAt?: Date | null;
};

const buildPixAdminRole = ({
  id = databaseBuffer.getNextId(),
  userId,
  role,
  createdAt = new Date(2022, 4, 12),
  updatedAt = new Date(2022, 4, 12),
  disabledAt = null,
}: PixAdminRoleAttributes) => {
  return databaseBuffer.pushInsertable({
    tableName: 'pix-admin-roles',
    values: { id, userId, role, createdAt, updatedAt, disabledAt },
  });
};

export { buildPixAdminRole };
