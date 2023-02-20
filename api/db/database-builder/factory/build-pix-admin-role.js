import databaseBuffer from '../database-buffer';

export default function buildPixAdminRole({
  id = databaseBuffer.getNextId(),
  userId,
  role,
  createdAt = new Date(2022, 4, 12),
  updatedAt = new Date(2022, 4, 12),
  disabledAt = null,
}) {
  return databaseBuffer.pushInsertable({
    tableName: 'pix-admin-roles',
    values: { id, userId, role, createdAt, updatedAt, disabledAt },
  });
}
