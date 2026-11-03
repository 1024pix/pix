import { datamartBuffer } from '../datamart-buffer.js';

export function buildReplicationMetadata({ replicationName, lastUpdatedAt }) {
  const values = {
    replication_name: replicationName,
    last_updated_at: lastUpdatedAt,
  };

  datamartBuffer.pushInsertable({
    tableName: 'replication_metadata',
    values,
  });
}
