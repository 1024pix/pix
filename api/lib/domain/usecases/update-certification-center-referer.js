const updateCertificationCenterReferer = async function ({
  userId,
  isReferer,
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  const actualReferer = await certificationCenterMembershipRepository.getRefererByCertificationCenterId({
    certificationCenterId,
  });

  if (actualReferer) {
    await certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId({
      userId: actualReferer.user.id,
      certificationCenterId,
      isReferer: false,
    });
  }

  return certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId({
    userId,
    certificationCenterId,
    isReferer,
  });
};

export { updateCertificationCenterReferer };
