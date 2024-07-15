import { TargetProfileForCreation } from '../models/index.js';

const copyTargetProfile = async function ({ targetProfileId, targetProfileRepository }) {
  const targetProfileToCopy = await targetProfileRepository.get(targetProfileId);
  const targetProfileTubes = await targetProfileRepository.getTubesByTargetProfileId(targetProfileId);

  const copiedTargetProfile = TargetProfileForCreation.copyTargetProfile({
    ...targetProfileToCopy,
    tubes: targetProfileTubes.map((tube) => ({
      id: tube.tubeId,
      level: tube.level,
    })),
  });

  return targetProfileRepository.create({
    targetProfileForCreation: copiedTargetProfile,
  });
};

export { copyTargetProfile };
