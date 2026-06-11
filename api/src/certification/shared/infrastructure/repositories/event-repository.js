import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';

/**
 *
 * @param {Event} event
 * @param event
 * @returns {Promise<void>}
 */
export async function push(event) {
  const isEventSourcingCertificationEnabled = await featureToggles.get('isEventSourcingCertificationEnabled');
  if (isEventSourcingCertificationEnabled) {
    const knexConn = DomainTransaction.getConnection();
    const eventDTO = {
      eventName: event.name,
      candidateId: event.candidateId,
      createdAt: event.createdAt,
      metadata: JSON.stringify(event.metadata),
    };
    await knexConn('certification_events').insert(eventDTO);
  }
}
