import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';

/**
 *
 * @param {Event[]} events
 * @returns {Promise<void>}
 */
export async function push(events) {
  const isEventSourcingCertificationEnabled = await featureToggles.get('isEventSourcingCertificationEnabled');
  if (isEventSourcingCertificationEnabled) {
    const eventDTOs = events.map((event) => ({
      eventName: event.name,
      candidateId: event.candidateId,
      createdAt: event.createdAt,
      metadata: JSON.stringify(event.metadata),
    }));
    const knexConn = DomainTransaction.getConnection();
    await knexConn.batchInsert('certification_events', eventDTOs).transacting(knexConn);
  }
}
