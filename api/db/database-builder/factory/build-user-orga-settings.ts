import { databaseBuffer } from '../database-buffer.ts';
import { buildOrganization } from './build-organization.js';
import { buildUser } from './build-user.ts';

type UserOrgaSettingsAttributes = {
  id?: number;
  currentOrganizationId?: number;
  userId?: number;
};

const buildUserOrgaSettings = ({
  id = databaseBuffer.getNextId(),
  currentOrganizationId = buildOrganization().id,
  userId = buildUser().id,
}: UserOrgaSettingsAttributes = {}) => {
  const values = { id, currentOrganizationId, userId };
  return databaseBuffer.pushInsertable({ tableName: 'user-orga-settings', values });
};

export { buildUserOrgaSettings };
