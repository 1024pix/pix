import { ComplementaryCertificationTargetProfileHistory } from '../../domain/models/ComplementaryCertificationTargetProfileHistory.js';

const getComplementaryCertificationTargetProfileHistory = async function ({
  complementaryCertificationId,
  complementaryCertificationTargetProfileHistoryRepository,
  complementaryCertificationRepository,
}) {
  const currentsTargetProfileHistoryWithBadgesByComplementaryCertification =
    await complementaryCertificationTargetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId(
      {
        complementaryCertificationId,
      },
    );

  const detachedTargetProfileHistoryByComplementaryCertification =
    await complementaryCertificationTargetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId(
      {
        complementaryCertificationId,
      },
    );

  const complementaryCertification = await complementaryCertificationRepository.getById({
    complementaryCertificationId,
  });

  return new ComplementaryCertificationTargetProfileHistory({
    ...complementaryCertification,
    targetProfilesHistory: [
      ...currentsTargetProfileHistoryWithBadgesByComplementaryCertification,
      ...detachedTargetProfileHistoryByComplementaryCertification,
    ],
  });
};

export { getComplementaryCertificationTargetProfileHistory };
