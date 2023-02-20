import certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository';

export default {
  async execute(userId, certificationCenterId) {
    return await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
      userId,
      certificationCenterId,
    });
  },
};
