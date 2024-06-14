import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCandidateNotFoundError } from '../../../../../lib/domain/errors.js';

const authorizeToStart = async function ({ certificationCandidateId, authorizedToStart }) {
  const result = await knex('certification-candidates')
    .where({
      id: certificationCandidateId,
    })
    .update({ authorizedToStart });

  if (!result) {
    throw new CertificationCandidateNotFoundError();
  }
};

export { authorizeToStart };
