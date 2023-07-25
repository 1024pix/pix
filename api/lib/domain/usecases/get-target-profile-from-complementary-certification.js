const getTargetProfileFromComplementaryCertification = function ({
  complementaryCertificationId,
  complementaryCertificationTargetProfileHistoryRepository,
}) {
  return complementaryCertificationTargetProfileHistoryRepository.getById({ complementaryCertificationId });
};

export { getTargetProfileFromComplementaryCertification };
