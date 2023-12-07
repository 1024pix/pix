const updateCertificationCenterMember = async function ({
  certificationCenterMemberId,
  role,
  updatedByUserId,
  certificationCenterMemberRepository,
}) {
  const certificationCenterMemberToUpdate =
    await certificationCenterMemberRepository.findById(certificationCenterMemberId);

  certificationCenterMemberToUpdate.updateRole({ role, updatedByUserId });

  await certificationCenterMemberRepository.update(certificationCenterMemberToUpdate);

  const updatedCertificationCenterMember =
    await certificationCenterMemberRepository.findById(certificationCenterMemberId);

  return updatedCertificationCenterMember;
};

export { updateCertificationCenterMember };
