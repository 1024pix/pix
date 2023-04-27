const certificationCenterMembershipRepository = require('../../infrastructure/repositories/certification-center-membership-repository.js');

module.exports = {
  async execute(userId, certificationCenterId, dependencies = { certificationCenterMembershipRepository }) {
    return await dependencies.certificationCenterMembershipRepository.isMemberOfCertificationCenter({
      userId,
      certificationCenterId,
    });
  },
};
