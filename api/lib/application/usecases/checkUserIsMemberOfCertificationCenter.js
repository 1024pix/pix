const certificationCenterMembershipRepository = require('../../infrastructure/repositories/certification-center-membership-repository');
module.exports = {
  async execute(userId, certificationCenterId) {
    return await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
      userId,
      certificationCenterId,
    });
  },
};
