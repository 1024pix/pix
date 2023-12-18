import { ComplementaryCertificationTargetProfileHistory } from '../models/ComplementaryCertificationTargetProfileHistory.js';

const getComplementaryCertificationTargetProfileHistory = async function ({
  complementaryCertificationId,
  targetProfileHistoryRepository,
  complementaryCertificationForTargetProfileAttachmentRepository,
}) {
  const currentsTargetProfileHistoryWithBadgesByComplementaryCertification =
    await targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId(
      {
        complementaryCertificationId,
      },
    );

  const detachedTargetProfileHistoryByComplementaryCertification =
    await targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId(
      {
        complementaryCertificationId,
      },
    );

  const complementaryCertification = await complementaryCertificationForTargetProfileAttachmentRepository.getById({
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
