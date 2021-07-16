const { knex } = require('../../../../db/knex-database-connection');
const { CertificationCenter } = require('../../domain/models/CertificationCenter');

async function get(id) {
  const certificationCenterDTO = await knex('certification-centers')
    .select('name')
    .where({ id })
    .first();

  if (!certificationCenterDTO) return null;

  return _toDomain(certificationCenterDTO);
}

function _toDomain(certificationCenterDTO) {
  return new CertificationCenter({
    name: certificationCenterDTO.name,
  });
}

module.exports = {
  get,
};
