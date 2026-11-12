import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const create = async function (creditsLotToCreate) {
  const knexConn = DomainTransaction.getConnection();
  const [{ id }] = await knexConn('credits_lots')
    .insert({
      structure_id: creditsLotToCreate.structureId,
      count: creditsLotToCreate.count,
      activation_date: creditsLotToCreate.activationDate,
      expiration_date: creditsLotToCreate.expirationDate,
      reference: creditsLotToCreate.reference,
      created_by: creditsLotToCreate.createdBy,
    })
    .returning('id');
  return id;
};

export { create };
