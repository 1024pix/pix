const { knex } = require('../../../../db/knex-database-connection');

async function exists({
  referentId,
  certificationCenterId,
}) {
  const exists = await knex('certification-center-memberships')
    .select('id')
    .where({ certificationCenterId, userId: referentId })
    .first();

  return Boolean(exists);
}

module.exports = {
  exists,
};
