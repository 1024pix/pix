import { knex } from '../../../../db/knex-database-connection.js';
import { BadRequestError } from '../../../../lib/application/http-errors.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import BadgeCriterion from '../../domain/models/BadgeCriterion.js';

const TABLE_NAME = 'badge-criteria';

const save = async function ({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const data = {
    ...badgeCriterion,
    // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
    cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
  };
  await (knexTransaction ?? knex)(TABLE_NAME).insert(data);
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

export { save, updateCriterion };
