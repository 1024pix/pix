import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CreditsLot } from '../../../domain/credits/models/CreditsLot.js';
import { CreditsLotBalance } from '../../../domain/credits/models/CreditsLotBalance.js';

const findByOrganizationIdForUpdate = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();

  const lots = await knexConn('credits_lots')
    .select(
      'credits_lots.id',
      'credits_lots.count',
      'credits_lots.activation_date as activationDate',
      'credits_lots.expiration_date as expirationDate',
    )
    .join('fct_structures', 'fct_structures.structure_id', 'credits_lots.structure_id')
    .where('fct_structures.organization_id', organizationId)
    .orderBy('credits_lots.id')
    .forUpdate('credits_lots');

  if (lots.length === 0) return [];

  const lotIds = lots.map((lot) => lot.id);

  const consumptions = await knexConn('credits_consumptions')
    .select('credit_lot_id')
    .count('id as consumedCount')
    .whereIn('credit_lot_id', lotIds)
    .groupBy('credit_lot_id');

  const countConsumedOn = function (lotId) {
    const consumption = consumptions.find(({ credit_lot_id }) => credit_lot_id === lotId);

    return consumption ? Number(consumption.consumedCount) : 0;
  };

  return lots.map((lot) => new CreditsLotBalance({ ...lot, consumedCount: countConsumedOn(lot.id) }));
};

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

/**
 * @type {function}
 * @param {number} structureId
 * @returns {Promise<Array<CreditsLot>>}
 */
const findAllByStructureId = async function (structureId) {
  const knexConn = DomainTransaction.getConnection();
  const creditsLot = await knexConn('credits_lots')
    .select(
      'credits_lots.id',
      'structure_id as structureId',
      'count',
      'activation_date as activationDate',
      'expiration_date as expirationDate',
      'reference',
      'users.lastName as creatorLastName',
      'users.firstName as creatorFirstName',
    )
    .join('users', 'users.id', 'credits_lots.created_by')
    .where({
      structure_id: structureId,
    })
    .orderBy('credits_lots.activation_date');

  return creditsLot.map(_toDomain);
};

function _toDomain(rawCreditsLot) {
  return new CreditsLot({
    id: rawCreditsLot.id,
    structureId: rawCreditsLot.structureId,
    count: rawCreditsLot.count,
    activationDate: rawCreditsLot.activationDate,
    expirationDate: rawCreditsLot.expirationDate,
    reference: rawCreditsLot.reference,
    creatorFirstName: rawCreditsLot.creatorFirstName,
    creatorLastName: rawCreditsLot.creatorLastName,
  });
}
export { create, findAllByStructureId, findByOrganizationIdForUpdate };
