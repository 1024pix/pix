import { PoleEmploiSending } from '../../../src/shared/domain/models/PoleEmploiSending.js';
import { databaseBuffer } from '../database-buffer.js';

const buildPoleEmploiSending = ({
  id = databaseBuffer.getNextId(),
  type = PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
  campaignParticipationId,
  isSuccessful = true,
  responseCode = '200',
  payload = null,
  createdAt = new Date('2020-01-01'),
} = {}) => {
  const values = {
    id,
    type,
    campaignParticipationId,
    isSuccessful,
    responseCode,
    payload,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'pole-emploi-sendings',
    values,
  });
};

export { buildPoleEmploiSending };
