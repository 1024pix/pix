const updateCertificationCenterMembership = async function ({
  certificationCenterMembershipId,
  role,
  updatedByUserId,
  certificationCenterMembershipRepository,
}) {
  const certificationCenterMembershipToUpdate = await certificationCenterMembershipRepository.findById(
    certificationCenterMembershipId,
  );

  certificationCenterMembershipToUpdate.updateRole({ role, updatedByUserId });

  await certificationCenterMembershipRepository.update(certificationCenterMembershipToUpdate);

  const updatedCertificationCenterMembership = await certificationCenterMembershipRepository.findById(
    certificationCenterMembershipId,
  );

  return updatedCertificationCenterMembership;
};

export { updateCertificationCenterMembership };
