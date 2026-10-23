import { databaseBuffer } from '../database-buffer.ts';

const buildPassageEvent = ({
  id = databaseBuffer.getNextId(),
  type = 'PASSAGE_STARTED',
  passageId = 1,
  sequenceNumber = 1,
  occurredAt = new Date('2019-04-28T02:42:00Z'),
  data = '{}',
} = {}) => {
  const values = { id, type, occurredAt, passageId, sequenceNumber, data };
  return databaseBuffer.pushInsertable({
    tableName: 'passage-events',
    values,
  });
};

export { buildPassageEvent };
