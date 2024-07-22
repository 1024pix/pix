import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { TargetProfile } from '../../../../../lib/domain/models/index.js';
import { NotFoundError, ObjectValidationError } from '../../../../shared/domain/errors.js';

const update = async function (targetProfile) {
  let results;
  const editedAttributes = _.pick(targetProfile, ['name', 'outdated', 'description', 'comment', 'isSimplifiedAccess']);

  try {
    results = await knex('target-profiles')
      .where({ id: targetProfile.id })
      .update(editedAttributes)
      .returning(['id', 'isSimplifiedAccess']);
  } catch (error) {
    throw new ObjectValidationError();
  }

  if (!results.length) {
    throw new NotFoundError(`Le profil cible avec l'id ${targetProfile.id} n'existe pas`);
  }

  return new TargetProfile(results[0]);
};

export { update };
