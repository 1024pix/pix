import * as injectedUserRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';

const createCertificationCenterMembershipByEmail = async function ({
  certificationCenterId,
  email,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
  userRepository = injectedUserRepository,
} = {}) {
  const { id: userId } = await userRepository.getByEmail(email);

  const isMembershipExisting = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
    userId,
    certificationCenterId,
  });

  if (isMembershipExisting) {
    throw new AlreadyExistingEntityError(
      `Certification center membership already exists for the user ID ${userId} and certification center ID ${certificationCenterId}.`,
    );
  }

  return certificationCenterMembershipRepository.save({ userId, certificationCenterId });
};

export { createCertificationCenterMembershipByEmail };
