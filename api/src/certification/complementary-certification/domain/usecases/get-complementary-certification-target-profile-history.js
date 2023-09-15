import { ComplementaryCertificationTargetProfileHistory } from '../models/ComplementaryCertificationTargetProfileHistory.js';

const getComplementaryCertificationTargetProfileHistory = async function ({
  complementaryCertificationId,
  complementaryCertificationTargetProfileHistoryRepository,
  complementaryCertificationForAdminRepository,
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

  const complementaryCertification = await complementaryCertificationForAdminRepository.getById({
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
