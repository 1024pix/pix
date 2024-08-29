import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationBadge } from '../../domain/read-models/ComplementaryCertificationBadge.js';
const ATTRS = ['id', 'label', 'imageUrl'];
const findAll = async function () {
  const complementaryCertificationBadgesData = await knex('complementary-certification-badges')
    .select(ATTRS)
    .orderBy('complementary-certification-badges.id', 'ASC');

  return complementaryCertificationBadgesData.map(_toDomain);
};

function _toDomain(complementaryCertificationBadgeData) {
  return new ComplementaryCertificationBadge(complementaryCertificationBadgeData);
}

export { findAll };
