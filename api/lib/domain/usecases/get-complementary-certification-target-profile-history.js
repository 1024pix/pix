const getComplementaryCertificationTargetProfileHistory = function ({
  complementaryCertificationId,
  complementaryCertificationTargetProfileHistoryRepository,
}) {
  return complementaryCertificationTargetProfileHistoryRepository.getById({ complementaryCertificationId });
};

export { getComplementaryCertificationTargetProfileHistory };
