const getComplementaryCertificationTargetProfileHistory = function ({
  complementaryCertificationId,
  complementaryCertificationTargetProfileHistoryRepository,
}) {
  return complementaryCertificationTargetProfileHistoryRepository.getByComplementaryCertificationId({
    complementaryCertificationId,
  });
};

export { getComplementaryCertificationTargetProfileHistory };
