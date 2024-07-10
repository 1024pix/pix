import { TargetProfileForCreation } from '../models/index.js';

const copyTargetProfile = async function ({ domainTransaction, targetProfileId, targetProfileRepository }) {
  const targetProfileToCopy = await targetProfileRepository.get(targetProfileId, domainTransaction);
  const targetProfileTubes = await targetProfileRepository.getTubesByTargetProfileId(
    targetProfileId,
    domainTransaction,
  );

  const copiedTargetProfile = TargetProfileForCreation.copyTargetProfile({
    ...targetProfileToCopy,
    tubes: targetProfileTubes.map((tube) => ({
      id: tube.tubeId,
      level: tube.level,
    })),
  });

  return targetProfileRepository.create({
    targetProfileForCreation: copiedTargetProfile,
    domainTransaction,
  });
};

export { copyTargetProfile };
