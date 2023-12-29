const disableCertificationCenterMembershipFromPixAdmin = async function ({
  certificationCenterMembershipId,
  updatedByUserId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.disableById({ certificationCenterMembershipId, updatedByUserId });
};

export { disableCertificationCenterMembershipFromPixAdmin };
