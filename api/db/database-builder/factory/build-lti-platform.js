import { databaseBuffer } from '../database-buffer.ts';

export function buildLtiPlatform({ id = databaseBuffer.getNextId(), origin = 'https://moodle.example.net' } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'lti_platforms',
    values: {
      id,
      origin,
    },
  });
}
