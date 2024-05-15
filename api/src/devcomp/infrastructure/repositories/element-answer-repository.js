import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ElementAnswer } from '../../domain/models/ElementAnswer.js';

const save = async function ({
  passageId,
  elementId,
  value,
  correction,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const [returnedElementAnswer] = await knexConn('element-answers')
    .insert({
      passageId,
      elementId,
      value,
      status: correction.status.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('*');

  return new ElementAnswer({
    id: returnedElementAnswer.id,
    elementId: returnedElementAnswer.elementId,
    userResponseValue: value,
    correction,
  });
};

export { save };
