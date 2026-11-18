import { databaseBuffer } from '../database-buffer.ts';
import { buildCreditsLot } from './build-credits-lot.js';

const buildCreditsConsumption = function buildCreditsConsumption({
  id = databaseBuffer.getNextId(),
  creditsLotId,
  organizationLearnerId,
  consumedAt = new Date('2020-01-02'),
} = {}) {
  creditsLotId = creditsLotId || buildCreditsLot().id;

  const values = {
    id,
    credit_lot_id: creditsLotId,
    organization_learner_id: organizationLearnerId,
    consumed_at: consumedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'credits_consumptions',
    values,
  });
};

export { buildCreditsConsumption };
