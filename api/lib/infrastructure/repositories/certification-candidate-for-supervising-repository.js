const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async update(certificationCandidateForSupervising) {
    const result = await knex('certification-candidates')
      .where({
        id: certificationCandidateForSupervising.id,
      })
      .update({ authorizedToStart: certificationCandidateForSupervising.authorizedToStart });

    if (result === 0) {
      throw new NotFoundError('Aucun candidat trouvé');
    }
  },
};
