module.exports = async function updateCertificationCenterReferer({
  userId,
  isReferer,
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId({
    userId,
    certificationCenterId,
    isReferer,
  });
};
