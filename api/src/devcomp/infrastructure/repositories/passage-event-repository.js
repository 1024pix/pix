import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../db/pgsql-errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const logger = child('devcomp:passage-event-repository', { event: SCOPES.DEVCOMP });

export async function record(event) {
  const knexConn = DomainTransaction.getConnection();
  try {
    await knexConn('passage-events').insert({
      passageId: event.passageId,
      sequenceNumber: event.sequenceNumber,
      occurredAt: event.occurredAt,
      type: event.type,
      data: event.data,
    });
  } catch (error) {
    if (error.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
      logger.error(event, 'There is already an existing event for this passageId and sequenceNumber');
      throw new DomainError('There is already an existing event for this passageId and sequenceNumber');
    }

    logger.error({ data: event, error }, 'Error when inserting passage event');

    throw error;
  }
}

export async function getHighestSequenceNumberForPassageId({ passageId }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select('sequenceNumber')
    .from('passage-events')
    .where('passageId', passageId)
    .orderBy('sequenceNumber', 'desc')
    .limit(1);
  return results[0].sequenceNumber;
}
