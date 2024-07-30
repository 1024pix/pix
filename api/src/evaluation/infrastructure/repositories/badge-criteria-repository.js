import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { BadRequestError } from '../../../shared/application/http-errors.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import BadgeCriterion from '../../domain/models/BadgeCriterion.js';

const TABLE_NAME = 'badge-criteria';

function adaptModelToDb(badgeCriterion) {
  delete badgeCriterion.id;
  const data = {
    ...badgeCriterion,
    // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
    cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
  };
  return data;
}

const save = async function ({ badgeCriterion }) {
  const knexConnection = DomainTransaction.getConnection();
  const data = adaptModelToDb(badgeCriterion);
  await knexConnection(TABLE_NAME).insert(data);
};

const saveAll = async function (badgeCriteria) {
  const knexConn = DomainTransaction.getConnection();
  const savedBadgeCriteria = await knexConn(TABLE_NAME).insert(badgeCriteria.map(adaptModelToDb)).returning('*');
  return savedBadgeCriteria.map((badgeCriteria) => new BadgeCriterion(badgeCriteria));
};

const updateCriterion = async function (id, attributesToUpdate) {
  if (Object.keys(attributesToUpdate).length === 0) {
    throw new BadRequestError("Erreur, aucune propriété n'est à mettre à jour");
  }

  const [updatedCriterion] = await knex(TABLE_NAME).update(attributesToUpdate).where({ id }).returning('*');

  if (!updatedCriterion) {
    throw new NotFoundError('Erreur, critère de résultat thématique introuvable');
  }

  return new BadgeCriterion(updatedCriterion);
};

const findAllByBadgeId = async (badgeId) => {
  const knexConn = DomainTransaction.getConnection();
  const badgeCriteria = await knexConn(TABLE_NAME).where('badgeId', badgeId);
  return badgeCriteria.map((badgeCriteria) => new BadgeCriterion(badgeCriteria));
};

export { findAllByBadgeId, save, saveAll, updateCriterion };
