const disableCertificationCenterMembership = async function ({
  certificationCenterMembershipId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.disableById({ certificationCenterMembershipId });
};

export { disableCertificationCenterMembership };
