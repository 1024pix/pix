import { eventBus as defaultEventBus } from '../../../../lib/domain/events/index.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { GarAuthenticationMethodAnonymized } from '../events/GarAuthenticationMethodAnonymized.js';

/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {string} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {DomainTransaction} params.domainTransaction
 * @param {EventBus} params.eventBus
 * @return {Promise<{anonymized: string[], total: number}>}
 */
export const anonymizeGarAuthenticationMethods = async function ({
  userIds,
  adminMemberId,
  authenticationMethodRepository,
  domainTransaction = DomainTransaction.emptyTransaction(),
  eventBus = defaultEventBus,
}) {
  const total = userIds.length;

  const { garAnonymizedUserIds } = await authenticationMethodRepository.batchAnonymizeByUserIds(
    { userIds },
    { domainTransaction },
  );

  const event = new GarAuthenticationMethodAnonymized({
    userIds: garAnonymizedUserIds,
    updatedByUserId: adminMemberId,
  });
  await eventBus.publish(event, domainTransaction);

  return { garAnonymizedUserIds, total };
};
