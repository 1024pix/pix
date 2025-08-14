import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';

/**
 * @param {{
 *   userId: string,
 *   userRepository: UserRepository
 * }} params
 * @return {Promise<User>}
 */
export const acceptPixCertifTermsOfService = withTransaction(function ({
  userId,
  userRepository = injectedUserRepository,
} = {}) {
  return userRepository.updatePixCertifTermsOfServiceAcceptedToTrue(userId);
});
