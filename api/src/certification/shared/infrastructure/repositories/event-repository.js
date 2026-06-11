import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 *
 * @param {Event} event
 * @param event
 * @returns {Promise<void>}
 */
export async function push(event) {
  const knexConn = DomainTransaction.getConnection();
  const eventDTO = {
    eventName: event.name,
    candidateId: event.candidateId,
    createdAt: event.createdAt,
    metadata: JSON.stringify(event.metadata),
  };
  await knexConn('certification_events').insert(eventDTO);
}
