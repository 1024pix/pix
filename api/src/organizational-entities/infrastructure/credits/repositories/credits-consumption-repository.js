import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const hasConsumptionOnLots = async function ({ organizationLearnerId, creditsLotIds }) {
  if (creditsLotIds.length === 0) return false;

  const knexConn = DomainTransaction.getConnection();

  const consumption = await knexConn('credits_consumptions')
    .select('id')
    .where({ organization_learner_id: organizationLearnerId })
    .whereIn('credit_lot_id', creditsLotIds)
    .first();

  return Boolean(consumption);
};

const save = async function ({ organizationLearnerId, creditsLotId }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('credits_consumptions').insert({
    organization_learner_id: organizationLearnerId,
    credit_lot_id: creditsLotId,
    consumed_at: knexConn.fn.now(),
  });
};

export { hasConsumptionOnLots, save };
