const getCertificationCenterMembersByCertificationCenter = function ({
  certificationCenterId,
  certificationCenterMemberRepository,
}) {
  return certificationCenterMemberRepository.findActiveByCertificationCenterIdSortedByRole({
    certificationCenterId,
  });
};

export { getCertificationCenterMembersByCertificationCenter };
