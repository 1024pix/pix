import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CreditsLot } from '../../../domain/credits/models/CreditsLot.js';

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
export { create, findAllByStructureId };
