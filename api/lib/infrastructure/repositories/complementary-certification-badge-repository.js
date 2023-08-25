import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { ComplementaryCertificationBadge } from '../../domain/models/ComplementaryCertificationBadge.js';

const findAllByComplementaryCertificationId = async function (complementaryCertificationId) {
  const results = await knex('complementary-certification-badges').where({ complementaryCertificationId });

  if (!results.length) {
    throw new NotFoundError();
  }

  return results.map(_toDomain);
};

function _toDomain(complementaryCertificationBadge) {
  return new ComplementaryCertificationBadge({ ...complementaryCertificationBadge });
}

export { findAllByComplementaryCertificationId };
