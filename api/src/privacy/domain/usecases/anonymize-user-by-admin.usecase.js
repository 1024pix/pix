import { UserNotFoundError } from '../../../shared/domain/errors.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.updatedByUserId
 * @returns {Promise<void>}
 */
export const anonymizeUserByAdmin = async function ({
  userId,
  updatedByUserId,
  adminMemberRepository,
  anonymizeServices,
  eventJobPublisherService,
}) {
  const anonymizedBy = await adminMemberRepository.get({
    userId: updatedByUserId,
  });
  if (!anonymizedBy) {
    throw new UserNotFoundError(`Admin not found for id: ${updatedByUserId}`);
  }

  const anonymizedByUserId = updatedByUserId;
  const anonymizedByUserRole = anonymizedBy.role;
  const client = 'PIX_ADMIN';

  await eventJobPublisherService.publishEvent('ANONYMIZE_USER_BY_ADMIN', {
    userId,
    updatedByUserId,
  });

  await anonymizeServices.anonymizeUser({
    userId,
    anonymizedByUserId,
    anonymizedByUserRole,
    client,
  });
};
