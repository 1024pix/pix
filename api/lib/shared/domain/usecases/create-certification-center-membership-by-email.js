import { AlreadyExistingEntityError } from '../errors.js';

const createCertificationCenterMembershipByEmail = async function ({
  certificationCenterId,
  email,
  certificationCenterMembershipRepository,
  userRepository,
}) {
  const { id: userId } = await userRepository.getByEmail(email);

  const isMembershipExisting = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
    userId,
    certificationCenterId,
  });

  if (isMembershipExisting) {
    throw new AlreadyExistingEntityError(
      `Certification center membership already exists for the user ID ${userId} and certification center ID ${certificationCenterId}.`
    );
  }

  return certificationCenterMembershipRepository.save({ userId, certificationCenterId });
};

export { createCertificationCenterMembershipByEmail };
