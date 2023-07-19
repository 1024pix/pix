const getTargetProfileFromComplementaryCertification = function ({
  complementaryCertificationId,
  complementaryCertificationRepository,
}) {
  return complementaryCertificationRepository.getTargetProfileById({ complementaryCertificationId });
};

export { getTargetProfileFromComplementaryCertification };
