import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { Passage } from '../../domain/models/Passage.js';

const save = async function ({ moduleId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [passage] = await knexConn('passages')
    .insert({
      moduleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('*');
  return new Passage(passage);
};

export { save };
