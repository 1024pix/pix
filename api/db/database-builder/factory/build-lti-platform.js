import { databaseBuffer } from '../database-buffer.ts';

export function buildLtiPlatform({
  id = databaseBuffer.getNextId(),
  issuer = 'https://moodle.example.net',
  organizationIds = [],
} = {}) {
  databaseBuffer.pushInsertable({
    tableName: 'lti_platforms',
    values: {
      id,
      issuer,
    },
  });
  for (const organizationId of organizationIds) {
    databaseBuffer.pushInsertable({
      tableName: 'lti_platform_organizations',
      values: {
        platformId: id,
        organizationId,
      },
    });
  }
  return { id, issuer, organizationIds };
}
