import { databaseBuffer } from '../database-buffer.js';

const buildFinalizedSession = function ({
  sessionId = databaseBuffer.getNextId(),
  certificationCenterName = 'Centre de certif PIX',
  finalizedAt = new Date('2020-01-01'),
  isPublishable = true,
  time = '10:00:00',
  date = '2019-12-25',
  publishedAt = null,
  assignedCertificationOfficerName = null,
  version = 2,
} = {}) {
  const values = {
    sessionId,
    certificationCenterName,
    finalizedAt,
    isPublishable,
    time,
    date,
    publishedAt,
    assignedCertificationOfficerName,
    version,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'finalized-sessions',
    values,
  });
};

export { buildFinalizedSession };
