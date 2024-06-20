import { eventBus as defaultEventBus } from '../../../../lib/domain/events/index.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { GarAuthenticationMethodAnonymized } from '../events/GarAuthenticationMethodAnonymized.js';

/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {string} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
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

  // TODO: Get the actual garAnonymizedUserIds that should be returned by authenticationMethodRepository.batchAnonymizeByUserIds
  const { anonymizedUserCount } = await authenticationMethodRepository.batchAnonymizeByUserIds(
    {
      userIds,
    },
    { domainTransaction },
  );

  const event = new GarAuthenticationMethodAnonymized({
    // TODO: Use the actual garAnonymizedUserIds that should be returned by authenticationMethodRepository.batchAnonymizeByUserIds
    userIds,
    updatedByUserId: adminMemberId,
  });
  await eventBus.publish(event, domainTransaction);

  return { anonymizedUserCount, total, userIds };
};
